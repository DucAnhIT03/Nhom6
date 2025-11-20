import React from "react";
import "./ContactForm.css";

export default function ContactForm() {
  return (
    <section className="intro-contact">
      <div className="contact">
        <h3>Liên hệ với chúng tôi</h3>
        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row">
            <label>Họ và tên:</label>
            <input type="text" placeholder="Họ và Tên" required />
          </div>
          <div className="form-row">
            <label>Email:</label>
            <input type="email" placeholder="Email" required />
          </div>
          <div className="form-row">
            <label>Số điện thoại:</label>
            <input type="tel" placeholder="Số Điện Thoại" required />
          </div>
          <div className="form-row">
            <label>Tin nhắn:</label>
            <textarea rows={1} placeholder="Tin Nhắn"></textarea>
          </div>
          <div className="form-actions">
            <button type="submit">GỬI NGAY</button>
          </div>
        </form>
      </div>
    </section>
  );
}
