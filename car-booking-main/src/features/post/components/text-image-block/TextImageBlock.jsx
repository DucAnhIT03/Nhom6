import React from "react";
import "./TextImageBlock.css";

export default function TextImageBlock({ src, alt, caption }) {
  return (
    <div className="text-img">
      <img src={src} alt={alt} className="content-img" />
      {caption && <p>{caption}</p>}
    </div>
  );
}
