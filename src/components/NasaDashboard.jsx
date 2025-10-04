import React, { useState } from "react";
import { motion } from "framer-motion";
import "./nasadashboard.css";

const weatherVariables = [
  { id: 1, name: "Temperature", param: "T2M" },
  { id: 2, name: "Precipitation", param: "PRECTOT" },
  { id: 3, name: "Wind Speed", param: "WS10M" },
  { id: 4, name: "Solar Radiation", param: "ALLSKY_SFC_SW_DWN" },
];

const API_BASE = "https://power.larc.nasa.gov/api/temporal/daily/point";

export default function NasaDashboard() {
  const [coords, setCoords] = useState({ lat: 20.5937, lon: 78.9629 }); // default India
  const [selectedVariable, setSelectedVariable] = useState(weatherVariables[0]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const fetchWeatherData = async () => {
  if (!coords) return;
  setLoading(true);
  setData(null);

  const start = "20251001"; // YYYYMMDD
  const end = "20251004";

  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M&community=AG&longitude=${coords.lon}&latitude=${coords.lat}&start=${start}&end=${end}&format=JSON`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (json.properties && json.properties.parameter && json.properties.parameter.T2M) {
      const paramData = json.properties.parameter.T2M;
      const latestDate = Object.keys(paramData)[0];
      setData({
        location: `Lat: ${coords.lat.toFixed(2)}, Lon: ${coords.lon.toFixed(2)}`,
        variable: "Temperature",
        value: paramData[latestDate],
      });
    } else {
      setData({ error: "No data available." });
    }
  } catch (err) {
    console.error(err);
    setData({ error: "Failed to fetch data." });
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="nasa-dashboard">
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1>NASA Earth Weather Insights</h1>
        <p>Click on the map, select a variable, and fetch real NASA POWER data.</p>
      </motion.header>

      {/* Coordinate Input */}
      <motion.div className="input-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <input
          type="number"
          placeholder="Latitude"
          value={coords.lat}
          onChange={(e) => setCoords({ ...coords, lat: parseFloat(e.target.value) })}
        />
        <input
          type="number"
          placeholder="Longitude"
          value={coords.lon}
          onChange={(e) => setCoords({ ...coords, lon: parseFloat(e.target.value) })}
        />

        <select
          value={selectedVariable.id}
          onChange={(e) =>
            setSelectedVariable(weatherVariables.find((v) => v.id === parseInt(e.target.value)))
          }
        >
          {weatherVariables.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>

        <button onClick={fetchWeatherData}>Analyze</button>
      </motion.div>

      {/* Result */}
      <div className="result-container">
        {loading ? (
          <div className="spinner"></div>
        ) : data ? (
          <motion.div className="result-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            {data.error ? (
              <p>{data.error}</p>
            ) : (
              <>
                <h2>{data.location}</h2>
                <p>
                  {data.variable}: <strong>{data.value}</strong>
                </p>
              </>
            )}
          </motion.div>
        ) : (
          <p>Enter coordinates and select a variable to get started.</p>
        )}
      </div>

      <footer>© 2025 NASA Earth Data | Built by Surya K.</footer>
    </div>
  );
}
