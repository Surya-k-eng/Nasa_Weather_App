import React, { useState } from "react";
import "./orderingpage.css";

const polymers = [
  { id: 1, name: "Polyethylene (PE)", color: "#4caf50" }, // green
  { id: 2, name: "Polypropylene (PP)", color: "#2196f3" }, // blue
  { id: 3, name: "Polystyrene (PS)", color: "#f44336" },   // red
  { id: 4, name: "Polyvinyl Chloride (PVC)", color: "#9c27b0" }, // purple
  { id: 5, name: "Polyethylene Terephthalate (PET)", color: "#ff9800" }, // orange
];

const OrderingPage = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* Header with hamburger button */}
      <div className="header">
        <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>
        <h1 className="header-title">MP-Insta Microscope</h1>
      </div>

      {/* Sidebar drawer (right side now) */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <h2>Polymers</h2>
        <ul className="polymer-list">
          {polymers.map((poly) => (
            <li key={poly.id} className="polymer-item">
              <span
                className="color-box"
                style={{ backgroundColor: poly.color }}
              ></span>
              {poly.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrderingPage;
