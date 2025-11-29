import React from "react";
import { useNavigate } from "react-router-dom";
import "./BusCard.css";
import { RiRoadMapFill, RiMapPinFill } from "react-icons/ri";

export default function BusCard({ bus, companyId }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (companyId) {
      navigate(`/garage/${companyId}`);
    }
  };

  return (
    <div 
      className="bus-card" 
      onClick={handleClick} 
      style={{ cursor: companyId ? 'pointer' : 'default' }}
    >
      <img src={bus.image} alt={bus.name} className="bus-card-img" />
      <div className="bus-card-body">
        <h3>{bus.name}</h3>
        {bus.description && (
          <p className="bus-card-address">
            <RiMapPinFill className="address-icon" />
            <span>{bus.description}</span>
          </p>
        )}
      </div>
    </div>
  );
}
