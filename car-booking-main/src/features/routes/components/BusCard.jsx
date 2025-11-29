import React from "react";
import { useNavigate } from "react-router-dom";
import "./BusCard.css";
import { RiRoadMapFill } from "react-icons/ri";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export default function BusCard({ route, minPrice }) {
  const navigate = useNavigate();
  const departure = route?.departureStation?.name || "Đang cập nhật";
  const arrival = route?.arrivalStation?.name || "Đang cập nhật";
  const companyName = route?.busCompany?.companyName || "Nhà xe đang cập nhật";
  const distance = route?.distance ? `${route.distance} km` : "";
  const duration = route?.duration ? `${route.duration} phút` : "";
  
  // Sử dụng minPrice nếu có, nếu không thì dùng route.price
  const displayPrice = minPrice !== undefined && minPrice !== null
    ? (minPrice > 0 ? currency.format(minPrice) : "Liên hệ")
    : (typeof route?.price === "number" && !Number.isNaN(route.price) && route.price > 0
        ? currency.format(route.price)
        : "Liên hệ");
  
  const cover = route?.busCompany?.image || "/tuyen.png";

  const handleClick = () => {
    if (route?.id) {
      navigate(`/routes/${route.id}`);
    }
  };

  return (
    <div 
      className="bus-card" 
      onClick={handleClick} 
      style={{ cursor: route?.id ? 'pointer' : 'default' }}
    >
      <img src={cover} alt={companyName} className="bus-card-img" />
      <div className="bus-card-body">
        <h3>
          <RiRoadMapFill size={18} color="#ff9800" />
          <span>
            {departure} → {arrival}
          </span>
        </h3>
        <p>{companyName}</p>
        <div className="bus-card-meta">
          <span className="price">{displayPrice}</span>
          <small>
            {distance}
            {distance && duration ? " · " : ""}
            {duration}
          </small>
        </div>
      </div>
    </div>
  );
}