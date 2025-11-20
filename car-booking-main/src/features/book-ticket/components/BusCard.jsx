import React from "react";
import { FaStar } from "react-icons/fa6";
import { IoBus } from "react-icons/io5";

export default function BusCard({ bus }) {
  return (
    <div className="bus-image">
      <img src={bus.image} className="bus-img" />

      <div className="bus-info">
        <div className="bus-header">
          <h3>{bus.name}</h3>
          <span className="rating">
            <FaStar /> {bus.rating}
          </span>
          <span className="rating-text">{bus.reviews} Đánh giá</span>
        </div>

        <p className="bus-type">{bus.type}</p>

        <div className="bus-time">
          <span className="start">{bus.start}</span>
          <div className="time-arrow">
            <span>1h30’</span>
            <img src="/right-arrow.png" alt="" />
          </div>
          <span className="end">{bus.end}</span>
        </div>

        <div className="location">
          <a>{bus.from}</a>
          <a>{bus.to}</a>
        </div>

        <div className="trip-info">
          <p className="trip-note">
            *Thuộc chuyến {bus.start} Hà Nội - Hải Phòng
          </p>
          <p className="more-info">Thông tin chi tiết</p>
        </div>
      </div>

      <div className="bus-right">
        <p className="price">
          Từ <span>{bus.price}</span> đ
        </p>
        <p className="empty">{bus.empty} Còn trống</p>
        <button className="choose-btn">
          <IoBus />
          Chọn xe
        </button>
      </div>
    </div>
  );
}
