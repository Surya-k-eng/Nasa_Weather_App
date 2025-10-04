import { useState, useEffect, useRef } from 'react';

export default function WeatherApp() {
  const [view, setView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentWeatherType, setCurrentWeatherType] = useState('normal');
  
  const searchRef = useRef(null);
  
  // Windy API Key
  const WINDY_API_KEY = 'UUbqiKREvbnEmRFxEbj8lOds7CKCJbQX';
  
  // Detect weather type based on temperature and conditions
  const getWeatherType = (temp, humidity, clouds) => {
    if (temp > 30) return 'summer';
    if (temp < 10) return 'winter';
    if (humidity > 80 || clouds > 70) return 'rainy';
    return 'normal';
  };
  
  // Handle location search with autocomplete using OpenStreetMap Nominatim (Free)
  const handleSearchChange = async (value) => {
    setSearchQuery(value);
    
    if (value.length > 2) {
      try {
        // Using OpenStreetMap Nominatim for free geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`
        );
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        alert('Error loading suggestions: ' + error.message);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  // Fetch weather data using Windy Point Forecast API
  const fetchWeatherData = async (lat, lon, cityName) => {
    setLoading(true);
    try {
      // Windy Point Forecast API requires POST request
      const response = await fetch('https://api.windy.com/api/point-forecast/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          model: 'gfs',
          parameters: ['temp', 'wind', 'rh', 'pressure', 'dewpoint', 'lclouds', 'mclouds', 'hclouds'],
          levels: ['surface'],
          key: WINDY_API_KEY
        })
      });
      
      const data = await response.json();
      
      if (data && data.ts && data.ts.length > 0) {
        // Get current weather data (first timestamp)
        const currentTemp = data['temp-surface'] ? data['temp-surface'][0] - 273.15 : 20; // Kelvin to Celsius
        const windU = data['wind_u-surface'] ? data['wind_u-surface'][0] : 0;
        const windV = data['wind_v-surface'] ? data['wind_v-surface'][0] : 0;
        const currentWind = Math.sqrt(windU * windU + windV * windV);
        const currentHumidity = data['rh-surface'] ? data['rh-surface'][0] : 50;
        const currentPressure = data['pressure-surface'] ? data['pressure-surface'][0] / 100 : 1013;
        const currentDewpoint = data['dewpoint-surface'] ? data['dewpoint-surface'][0] - 273.15 : 15;
        
        // Calculate cloud coverage
        const lowClouds = data['lclouds-surface'] ? data['lclouds-surface'][0] : 0;
        const midClouds = data['mclouds-surface'] ? data['mclouds-surface'][0] : 0;
        const highClouds = data['hclouds-surface'] ? data['hclouds-surface'][0] : 0;
        const totalClouds = Math.max(lowClouds, midClouds, highClouds);
        
        // Determine weather condition
        let weatherCondition = 'Clear';
        if (totalClouds > 80 && currentHumidity > 80) {
          weatherCondition = 'Rainy';
        } else if (totalClouds > 60) {
          weatherCondition = 'Cloudy';
        } else if (totalClouds > 30) {
          weatherCondition = 'Partly Cloudy';
        }
        
        const weatherType = getWeatherType(currentTemp, currentHumidity, totalClouds);
        setCurrentWeatherType(weatherType);
        
        setWeatherData({
          cityName: cityName,
          lat: lat,
          lon: lon,
          temp: currentTemp,
          feels_like: currentTemp - (currentWind * 0.3), // Wind chill approximation
          humidity: currentHumidity,
          wind_speed: currentWind,
          pressure: currentPressure,
          dewpoint: currentDewpoint,
          condition: weatherCondition,
          clouds: totalClouds,
          visibility: currentHumidity < 90 ? 10 : 5,
          timestamp: new Date(data.ts[0])
        });
        
        setView('dashboard');
        setShowSuggestions(false);
      } else {
        alert('Unable to fetch weather data for this location.');
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      alert('Failed to fetch weather data. Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    const cityName = suggestion.display_name.split(',')[0];
    const displayName = `${cityName}, ${suggestion.display_name.split(',').slice(-1)[0].trim()}`;
    
    setSearchQuery(displayName);
    fetchWeatherData(suggestion.lat, suggestion.lon, displayName);
  };
  
  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Get weather icon based on condition
  const getWeatherIcon = (condition) => {
    const icons = {
      'Clear': '☀️',
      'Partly Cloudy': '⛅',
      'Cloudy': '☁️',
      'Rainy': '🌧️',
      'Snow': '❄️',
      'Thunderstorm': '⛈️'
    };
    return icons[condition] || '🌤️';
  };
  
  // Animated background elements
  const AnimatedBackground = ({ type }) => {
    return (
      <div className="animated-bg">
        {type === 'summer' && (
          <>
            <div className="sun"></div>
            {[...Array(20)].map((_, i) => (
              <div key={i} className="sun-ray" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}></div>
            ))}
          </>
        )}
        
        {type === 'rainy' && (
          <>
            {[...Array(100)].map((_, i) => (
              <div key={i} className="raindrop" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`
              }}></div>
            ))}
            <div className="clouds">
              <div className="cloud cloud1"></div>
              <div className="cloud cloud2"></div>
              <div className="cloud cloud3"></div>
            </div>
          </>
        )}
        
        {type === 'winter' && (
          <>
            {[...Array(50)].map((_, i) => (
              <div key={i} className="snowflake" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
                fontSize: `${10 + Math.random() * 10}px`
              }}>❄</div>
            ))}
          </>
        )}
        
        {type === 'normal' && (
          <div className="clouds">
            <div className="cloud cloud1"></div>
            <div className="cloud cloud2"></div>
            <div className="cloud cloud3"></div>
          </div>
        )}
      </div>
    );
  };
  
  // Home Page
  if (view === 'home') {
    return (
      <div className={`home-container bg-${currentWeatherType}`}>
        <AnimatedBackground type={currentWeatherType} />
        
        <div className="home-content">
          <h1 className="main-title">WeatherNow</h1>
          
          <p className="subtitle">
            Discover real-time weather conditions anywhere in the world. 
            Search your location and get instant weather updates with beautiful visualizations powered by Windy.
          </p>
          
          <div ref={searchRef} className="search-container">
            <div className="search-wrapper">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Enter city name (e.g., London, Tokyo, New York)..."
                className="search-input"
              />
              <button className="search-button">
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="suggestion-item"
                  >
                    <svg className="location-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="suggestion-info">
                      <div className="suggestion-name">{suggestion.display_name.split(',')[0]}</div>
                      <div className="suggestion-country">{suggestion.display_name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-text">Fetching weather data from Windy...</p>
            </div>
          )}
        </div>
        
        <style jsx>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          .home-container {
            min-height: 100vh;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          .bg-normal {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .bg-summer {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }

          .bg-winter {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }

          .bg-rainy {
            background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
          }

          .animated-bg {
            position: absolute;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
          }

          .home-content {
            position: relative;
            z-index: 10;
            text-align: center;
            padding: 0 24px;
            max-width: 900px;
            width: 100%;
          }

          .main-title {
            font-size: 80px;
            font-weight: 700;
            color: white;
            margin-bottom: 24px;
            letter-spacing: -2px;
            text-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            animation: fadeIn 1s ease-out;
          }

          .subtitle {
            font-size: 22px;
            color: rgba(255, 255, 255, 0.95);
            margin-bottom: 48px;
            line-height: 1.6;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            animation: fadeIn 1s ease-out 0.3s both;
          }

          .search-container {
            position: relative;
            max-width: 700px;
            margin: 0 auto;
            animation: slideUp 1s ease-out 0.6s both;
          }

          .search-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .search-input {
            width: 100%;
            padding: 20px 70px 20px 24px;
            border-radius: 50px;
            font-size: 18px;
            border: none;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            outline: none;
            transition: all 0.3s ease;
          }

          .search-input:focus {
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 4px rgba(255, 255, 255, 0.3);
          }

          .search-button {
            position: absolute;
            right: 8px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            padding: 12px;
            border-radius: 50%;
            cursor: pointer;
            transition: transform 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .search-button:hover {
            transform: scale(1.1);
          }

          .search-icon {
            width: 24px;
            height: 24px;
            color: white;
          }

          .suggestions-dropdown {
            position: absolute;
            width: 100%;
            margin-top: 8px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            z-index: 20;
            max-height: 400px;
            overflow-y: auto;
          }

          .suggestion-item {
            padding: 16px 24px;
            cursor: pointer;
            transition: background 0.2s ease;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            align-items: flex-start;
            gap: 12px;
          }

          .suggestion-item:last-child {
            border-bottom: none;
          }

          .suggestion-item:hover {
            background: linear-gradient(90deg, #f0f7ff 0%, #f5f0ff 100%);
          }

          .location-icon {
            width: 20px;
            height: 20px;
            color: #999;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .suggestion-info {
            flex: 1;
            text-align: left;
          }

          .suggestion-name {
            font-weight: 600;
            color: #333;
            font-size: 16px;
          }

          .suggestion-country {
            font-size: 13px;
            color: #666;
            margin-top: 4px;
            line-height: 1.4;
          }

          .loading-container {
            margin-top: 32px;
            color: white;
            font-size: 18px;
          }

          .spinner {
            display: inline-block;
            width: 32px;
            height: 32px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          .loading-text {
            margin-top: 12px;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .sun {
            position: absolute;
            top: 10%;
            right: 10%;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, #ffd700 0%, #ffed4e 100%);
            border-radius: 50%;
            box-shadow: 0 0 60px #ffd700;
            animation: pulse 3s ease-in-out infinite;
          }

          .sun-ray {
            position: absolute;
            width: 3px;
            height: 20px;
            background: linear-gradient(transparent, rgba(255, 215, 0, 0.8));
            animation: float 3s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0);
              opacity: 0.3;
            }
            50% {
              transform: translateY(-20px);
              opacity: 0.8;
            }
          }

          .raindrop {
            position: absolute;
            width: 2px;
            height: 20px;
            background: linear-gradient(transparent, rgba(255, 255, 255, 0.8));
            animation: fall 1s linear infinite;
          }

          @keyframes fall {
            to {
              transform: translateY(100vh);
            }
          }

          .snowflake {
            position: absolute;
            color: white;
            animation: snow 5s linear infinite;
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
          }

          @keyframes snow {
            0% {
              transform: translateY(-10px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(360deg);
              opacity: 0.8;
            }
          }

          .clouds {
            position: absolute;
            width: 100%;
            height: 100%;
          }

          .cloud {
            position: absolute;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 100px;
            animation: drift 20s linear infinite;
          }

          .cloud::before,
          .cloud::after {
            content: '';
            position: absolute;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
          }

          .cloud1 {
            width: 100px;
            height: 40px;
            top: 20%;
            left: -100px;
          }

          .cloud1::before {
            width: 50px;
            height: 50px;
            top: -25px;
            left: 10px;
          }

          .cloud1::after {
            width: 60px;
            height: 40px;
            top: -20px;
            right: 10px;
          }

          .cloud2 {
            width: 150px;
            height: 50px;
            top: 40%;
            left: -150px;
            animation-delay: 5s;
            animation-duration: 25s;
          }

          .cloud2::before {
            width: 70px;
            height: 70px;
            top: -35px;
            left: 20px;
          }

          .cloud2::after {
            width: 80px;
            height: 50px;
            top: -25px;
            right: 20px;
          }

          .cloud3 {
            width: 120px;
            height: 45px;
            top: 60%;
            left: -120px;
            animation-delay: 10s;
            animation-duration: 30s;
          }

          .cloud3::before {
            width: 60px;
            height: 60px;
            top: -30px;
            left: 15px;
          }

          .cloud3::after {
            width: 70px;
            height: 45px;
            top: -22px;
            right: 15px;
          }

          @keyframes drift {
            to {
              left: calc(100% + 200px);
            }
          }

          @media (max-width: 768px) {
            .main-title {
              font-size: 48px;
            }
            
            .subtitle {
              font-size: 18px;
            }
            
            .search-input {
              font-size: 16px;
              padding: 18px 60px 18px 20px;
            }
          }
        `}</style>
      </div>
    );
  }
  
  // Dashboard Page
  return (
    <div className={`dashboard-container dashboard-${currentWeatherType}`}>
      <AnimatedBackground type={currentWeatherType} />
      
      <div className="dashboard-content">
        <button onClick={() => setView('home')} className="back-button">
          <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Search
        </button>
        
        {weatherData && (
          <div className="dashboard-wrapper">
            <div className="weather-card">
              <div className="weather-header">
                <div>
                  <h2 className="city-name">{weatherData.cityName}</h2>
                  <p className="date-text">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="weather-icon-large">{getWeatherIcon(weatherData.condition)}</div>
              </div>
              
              <div className="weather-details">
                <div className="main-weather">
                  <div className="temperature">
                    {Math.round(weatherData.temp)}°C
                  </div>
                  <div className="weather-description">
                    {weatherData.condition}
                  </div>
                  <div className="feels-like">
                    Feels like {Math.round(weatherData.feels_like)}°C
                  </div>
                  <div className="data-source">
                    Data from Windy API
                  </div>
                </div>
                
                <div className="weather-stats">
                  <div className="stat-card stat-blue">
                    <div className="stat-label">Humidity</div>
                    <div className="stat-value">{Math.round(weatherData.humidity)}%</div>
                  </div>
                  <div className="stat-card stat-purple">
                    <div className="stat-label">Wind Speed</div>
                    <div className="stat-value">{weatherData.wind_speed.toFixed(1)} m/s</div>
                  </div>
                  <div className="stat-card stat-pink">
                    <div className="stat-label">Pressure</div>
                    <div className="stat-value">{Math.round(weatherData.pressure)} hPa</div>
                  </div>
                  <div className="stat-card stat-orange">
                    <div className="stat-label">Dew Point</div>
                    <div className="stat-value">{Math.round(weatherData.dewpoint)}°C</div>
                  </div>
                  <div className="stat-card stat-green">
                    <div className="stat-label">Cloud Cover</div>
                    <div className="stat-value">{Math.round(weatherData.clouds)}%</div>
                  </div>
                  <div className="stat-card stat-teal">
                    <div className="stat-label">Visibility</div>
                    <div className="stat-value">{weatherData.visibility} km</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="map-card">
              <h3 className="map-title">Interactive Weather Map</h3>
              <div className="map-container">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://embed.windy.com/embed2.html?lat=${weatherData.lat}&lon=${weatherData.lon}&detailLat=${weatherData.lat}&detailLon=${weatherData.lon}&width=650&height=450&zoom=8&level=surface&overlay=temp&product=ecmwf&menu=&message=&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`}
                  allowFullScreen
                />
              </div>
              <p className="map-note">🌬️ Interactive weather map powered by Windy - Click and drag to explore</p>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .dashboard-summer {
          background: linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%);
        }

        .dashboard-winter {
          background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        }

        .dashboard-rainy {
          background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
        }

        .dashboard-normal {
          background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%);
        }

        .dashboard-content {
          position: relative;
          z-index: 10;
          padding: 24px;
        }

        .back-button {
          margin-bottom: 24px;
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 50px;
          border: none;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 500;
        }

        .back-button:hover {
          transform: scale(1.05);
        }

        .back-icon {
          width: 20px;
          height: 20px;
        }

        .dashboard-wrapper {
          max-width: 1200px;
          margin: 0 auto;
        }

        .weather-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 30px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          padding: 40px;
          margin-bottom: 24px;
        }

        .weather-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .city-name {
          font-size: 48px;
          font-weight: 700;
          color: #333;
          margin-bottom: 8px;
        }

        .date-text {
          color: #666;
          font-size: 18px;
        }

        .weather-icon-large {
          font-size: 128px;
          line-height: 1;
        }

        .weather-details {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 40px;
        }

        .temperature {
          font-size: 80px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
        }

        .weather-description {
          font-size: 28px;
          color: #555;
          text-transform: capitalize;
          margin-bottom: 16px;
        }

        .feels-like {
          color: #666;
          font-size: 16px;
          margin-bottom: 8px;
        }

        .data-source {
          color: #999;
          font-size: 13px;
          font-style: italic;
          margin-top: 12px;
        }

        .weather-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .stat-card {
          padding: 20px;
          border-radius: 16px;
          transition: transform 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
        }

        .stat-blue {
          background: linear-gradient(135deg, #e0f2ff 0%, #dbeafe 100%);
        }

        .stat-purple {
          background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
        }

        .stat-pink {
          background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
        }

        .stat-orange {
          background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%);
        }

        .stat-green {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        }

        .stat-teal {
          background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%);
        }

        .stat-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #333;
        }

        .map-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 30px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          padding: 40px;
        }

        .map-title {
          font-size: 28px;
          font-weight: 700;
          color: #333;
          margin-bottom: 20px;
        }

        .map-container {
          width: 100%;
          height: 450px;
          background: #e5e7eb;
          border-radius: 16px;
          overflow: hidden;
        }

        .map-note {
          margin-top: 12px;
          text-align: center;
          color: #666;
          font-size: 14px;
          font-style: italic;
        }

        @media (max-width: 968px) {
          .weather-details {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .city-name {
            font-size: 36px;
          }
          
          .temperature {
            font-size: 60px;
          }
          
          .weather-description {
            font-size: 24px;
          }
          
          .weather-icon-large {
            font-size: 96px;
          }
          
          .weather-stats {
            grid-template-columns: 1fr;
          }
          
          .weather-card, .map-card {
            padding: 24px;
          }
          
          .map-container {
            height: 350px;
          }
        }
      `}</style>
    </div>
  );
}