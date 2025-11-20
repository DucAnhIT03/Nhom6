import React from "react";
import "./PostBanner.css";

export default function PostBanner({ image, title, subtitle }) {
  return (
    <div className="img-banner">
      <img src={image} alt={title} />
      <div className="banner-text">
        <p>{title}</p>
        <p>{subtitle}</p>
      </div>
      <div className="overlay"></div>
    </div>
  );
}
