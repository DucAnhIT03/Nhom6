import React from "react";
import "./BusCard.css";
import { RiRoadMapFill } from "react-icons/ri";

export default function BusCard({ bus }) {
  return (
    <div className="bus-card">
      {bus.image ? (
        <img src={bus.image} alt={bus.name} className="bus-card-img" />
      ) : (
        <div className="bus-card-img-placeholder">
          <span>Không có ảnh</span>
        </div>
      )}
      <div className="bus-card-body">
        <h3>{bus.name}</h3>
        {bus.location && (
          <div className="bus-card-location">
            <RiRoadMapFill />
            <span>{bus.location}</span>
          </div>
        )}
        {bus.descriptions && (
          <p>{bus.descriptions}</p>
        )}
      </div>
    </div>
  );
}
