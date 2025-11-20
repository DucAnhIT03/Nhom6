import React from "react";
import "./CheckTicket.css";
import TopHeader from "../../../shared/components/header/TopHeader";
import NavigationBar from "../../../shared/components/header/NavigationBar";
import Footer from "../../../shared/components/footer/Footer";

export default function CheckTicket() {
  return (
    <>
      <TopHeader />
      <NavigationBar />
      <div className="checkticket-container">
        <div className="left-panel">
          <h2 className="title">Nhập thông tin vé xe</h2>

          <div className="input-group">
            <input type="text" id="maVe" placeholder="Mã Vé" />
          </div>

          <div className="input-group">
            <input
              type="tel"
              id="soDienThoai"
              placeholder="Số điện thoại (Bắt Buộc)"
            />
          </div>

          <button className="check-button">Kiểm tra vé</button>

          <div className="note-box">
            <strong>Lưu ý:</strong>
            Trường hợp bạn không thể hủy vé qua mạng hoặc muốn đổi sang đơn hàng
            khác vui lòng liên hệ chúng tôi qua số điện thoại{" "}
            <span className="phone-number">1900 7070</span> hoặc{" "}
            <span className="phone-number">1900969681</span>
          </div>
        </div>

        <div className="right-panel">
          <div className="ad-top-bar">
            <p>Vui lòng nhập vào thông tin và bấm Kiểm tra vé</p>
          </div>
          <div className="ad-banner">
            <img src="./booked-ticket.png" alt="Đặt vé ngay - Gọi 1900 0152" />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
