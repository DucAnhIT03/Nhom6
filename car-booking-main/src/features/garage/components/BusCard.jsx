import React from "react";
import "./BusCard.css";
import { RiRoadMapFill } from "react-icons/ri";

export default function BusCard({ bus }) {
  return (
    <div className="bus-card">
      <img src={bus.image} alt={bus.name} className="bus-card-img" />
      <div className="bus-card-body">
        <h3>{bus.name}</h3>
        <p>
          {bus.description}
        </p>
      </div>
    </div>
  );
}
