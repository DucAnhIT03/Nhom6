import React from "react";
import "./IntroHero.css";

export default function IntroHero() {
  return (
    <section className="intro-hero">
      <div className="intro-hero-content">
        <p>
          <span>Tiện lợi, tận tâm, </span> an toàn.
        </p>
        <div className="content">
          <p>Theo dõi chúng tôi tại:</p>
          <div className="image-content">
            <img src="/logo.png" alt="" width={134} />
            <img src="/zalo.png" alt="" width={73} height={71} />
            <img src="/fb.png" alt="" width={71} height={71} />
          </div>
        </div>
      </div>
      <div className="intro-hero-bg">
        <img src="/banner4.png" alt="" />
      </div>
    </section>
  );
}
