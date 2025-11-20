import React from "react";
import "./WhyChooseUs.css";

export default function WhyChooseUs() {
  return (
    <section className="intro-why">
      <div className="container why-wrapper">
        <h2 className="why-title">
          Lý do bạn nên đặt vé tại <span>Vivutoday.com</span>
        </h2>

        <div className="why-layout">
          <div className="why-col">
            <div className="why-item">
              <h4>Tìm Kiếm Thông Tin Một Cách Dễ Dàng</h4>
              <p>
                Giao diện của VivuToday.com được thiết kế để giúp bạn tìm kiếm
                thông tin nhà xe, giờ khởi hành, điểm xuất phát và đích một cách
                nhanh chóng và dễ dàng. Thông qua việc nhập các thông tin cơ
                bản, bạn có thể tìm kiếm lịch trình phù hợp chỉ trong vài giây.
              </p>
            </div>
            <div className="why-item">
              <h4>Tùy Chỉnh Theo Tài Chính Của Bạn</h4>
              <p>
                Chúng tôi hiểu rằng mỗi hành trình có một ngân sách riêng. Với
                giao diện của chúng tôi, bạn có thể tùy chỉnh lựa chọn những nhà
                xe nằm trong khoảng giá tiền mà bạn mong muốn. Điều này giúp bạn
                tiết kiệm thời gian và tìm được các lựa chọn phù hợp với túi
                tiền.
              </p>
            </div>
          </div>

          <div className="why-center">
            <img src="/ava.png" alt="Mascot" />
          </div>

          <div className="why-col">
            <div className="why-item">
              <h4>Lựa Chọn Nhà Xe Có Đánh Giá Cao</h4>
              <p>
                Việc thanh toán không còn là vấn đề khiến bạn lo lắng. Chúng tôi
                cung cấp các phương thức thanh toán đa dạng bao gồm thanh toán
                trực tuyến, qua ngân hàng và epays. Đảm bảo bạn có sự linh hoạt
                trong việc chọn phương thức phù hợp với bạn và đảm bảo tính an
                toàn cho giao dịch.
              </p>
            </div>
            <div className="why-item">
              <h4>Thanh Toán An Toàn</h4>
              <p>
                Việc thanh toán không còn là vấn đề khiến bạn lo lắng. Chúng tôi
                cung cấp các phương thức thanh toán đa dạng bao gồm thanh toán
                trực tuyến, qua ngân hàng và epays. Đảm bảo bạn có sự linh hoạt
                trong việc chọn phương thức phù hợp với bạn và đảm bảo tính an
                toàn cho giao dịch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
