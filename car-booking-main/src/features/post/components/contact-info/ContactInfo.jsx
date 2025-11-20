import React from "react";
import "./ContactInfo.css";

export default function ContactInfo({ phone, address }) {
  return (
    <div className="contact-info">
      <div>Điện thoại: {phone}</div>
      <div>Địa chỉ: {address}</div>
    </div>
  );
}
