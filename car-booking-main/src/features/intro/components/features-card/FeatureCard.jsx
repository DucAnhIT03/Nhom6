import React from "react";
import "./FeatureCard.css";

export default function FeatureCards() {
  return (
    <section className="intro-system">
      <div className="container">
        <h2>
          Hệ thống đặt vé xe toàn quốc <span>Vivutoday.com</span>
        </h2>
        <p className="lead">
          Trong thời đại số hóa ngày nay, việc sử dụng công nghệ thông tin để
          giải quyết nhu cầu của cuộc sống trở nên quen thuộc. Khi bạn cần tìm
          một trang web đáng tin cậy để đặt vé xe, VivuToday.com sẽ là người bạn
          đáng tin để giúp bạn di chuyển một cách an toàn và tiện lợi.
        </p>
        <div className="feature-cards">
          <div className="feature-item">
            <p>
              Chúng tôi cam kết đảm bảo cho bạn môi trường đáng tin cậy để đặt
              vé xe. Với việc kiểm tra độ tin cậy và sự hợp tác với các đối tác
              uy tín, chúng tôi đảm bảo mỗi chuyến đi của bạn diễn ra an toàn và
              suôn sẻ
            </p>
            <h3>An Toàn Được Đảm Bảo</h3>
          </div>
          <div className="feature-item">
            <p>
              Với đội ngũ tư vấn viên chuyên nghiệp luôn sẵn sàng hỗ trợ 24/7,
              chúng tôi sẽ giúp bạn mọi lúc bạn cần. Điều này đảm bảo bạn luôn
              có một người bạn đồng hành đáng tin trong mỗi hành trình.
            </p>
            <h3>An Tâm Tận Tâm</h3>
          </div>
          <div className="feature-item">
            <span>
              <b>1500+</b> nhà xe
            </span>
            <span>
              <b>5000+</b> lịch trình
            </span>
            <p style={{ color: "rgba(0, 0, 0, 1)" }}>
              Chúng tôi cung cấp nhiều sự lựa chọn để đáp ứng mọi nhu cầu của
              khách hàng.
            </p>
            <h3 style={{ color: "rgba(0, 148, 222, 1)" }}>
              An Đáng Sự Lựa Chọn
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}
