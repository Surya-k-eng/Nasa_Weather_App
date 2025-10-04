  import NasaDashboard from "./components/NasaDashboard";
  import { Routes, Route } from "react-router-dom";
  import 'leaflet/dist/leaflet.css';


  const App = () => {
  return (
    <div>
      <Routes>
        <Route 
          path="/" 
          element={
            <div>
              <NasaDashboard/>
            </div>
          } 
        />
        
      </Routes>
    </div>
  );
};

export default App;
