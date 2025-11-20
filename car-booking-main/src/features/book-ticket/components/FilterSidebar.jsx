import React from "react";

export default function FilterSidebar() {
  return (
    <div className="filter-sidebar">
      <h3 className="filter-title">Tiêu chí phổ biến</h3>

      <label className="checkbox-line">
        <input type="checkbox" /> Chuyến giảm giá (370)
      </label>

      <label className="checkbox-line">
        <input type="checkbox" /> Xe VIP Limousine (433)
      </label>

      <div className="filter-block">
        <p className="filter-label">Giờ đi</p>
        <input type="range" min="0" max="23" />
      </div>

      <div className="filter-block">
        <p className="filter-label">Giá vé</p>
        <input type="range" min="0" max="2000000" />
      </div>

      <div className="filter-block">
        <p className="filter-label">Nhà xe</p>

        <div className="checkbox-scroll">
          <label className="checkbox-line">
            <input type="checkbox" /> Anh Huy (Hải Phòng)
          </label>
          <label className="checkbox-line">
            <input type="checkbox" /> Anh Huy Đất Cảng
          </label>
          <label className="checkbox-line">
            <input type="checkbox" /> Anh Huy Travel
          </label>
          <label className="checkbox-line">
            <input type="checkbox" /> Bằng Phấn
          </label>
          <label className="checkbox-line">
            <input type="checkbox" /> Cát Bà Express
          </label>
          <label className="checkbox-line">
            <input type="checkbox" /> Cát Bà Go Easy Limousine
          </label>
        </div>
      </div>

      <button className="clear-btn">Xoá đã chọn</button>
    </div>
  );
}
