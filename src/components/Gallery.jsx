import React, { useState, useEffect } from "react";
import "./gallery.css";

const dashboardButtons = [
  { id: 1, name: "Live Feed", action: () => alert("Showing Live Feed") },
  { id: 2, name: "Upload", action: () => alert("Upload clicked") },
  { id: 3, name: "Analysis", action: () => alert("Analysis clicked") },
  { id: 4, name: "Gallery", action: () => alert("Gallery clicked") },
];

const MicroscopeDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState("/Screenshot from 2025-09-19 14-27-14.png");

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => setLoading(false);
    img.onerror = () => setLoading(true);
  }, [imageSrc]);

  return (
    <div className="dashboard">
      <header className="dash-header">
      </header>

      <div className="image-container">
        {loading ? (
          <img src="/loading.gif" alt="Loading..." className="loading-img" />
        ) : (
          <img src={imageSrc} alt="Microscope" className="main-img" />
        )}
      </div>

      <div className="button-row">
        {dashboardButtons.map((btn) => (
          <button
            key={btn.id}
            className="dash-button"
            onClick={btn.action}
          >
            {btn.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MicroscopeDashboard;
