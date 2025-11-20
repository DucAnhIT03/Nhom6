import "./Footer.css";

const Footer = () => {
  // Dữ liệu mô phỏng - bạn có thể bổ sung thêm theo nhu cầu
  const news = [
    "Xe Limousine – Đẳng cấp hạng thương gia thời đại mới",
    "Tổng quan các bến xe Vũng Tàu – Giới thiệu thông tin lịch trình nhà xe",
    "Top 31 nhà xe limousine, xe giường nằm đi Đà Lạt",
  ];

  const routes = [
    "Xe đi Buôn Mê Thuột từ Sài Gòn",
    "Xe đi Vũng Tàu từ Sài Gòn",
    "Xe đi Nha Trang từ Sài Gòn",
    "Xe đi Đà Lạt từ Sài Gòn",
    "Xe đi Sapa từ Hà Nội",
    "Xe đi Hải Phòng từ Hà Nội",
    "Xe đi Vinh từ Hà Nội",
  ];

  const limousines = [
    "Xe Limousine đi Đà Lạt từ Sài Gòn",
    "Xe Limousine đi Vũng Tàu từ Sài Gòn",
    "Xe Limousine đi Nha Trang từ Sài Gòn",
    "Xe Limousine đi Hải Phòng từ Hà Nội",
    "Xe Limousine đi Hạ Long từ Hà Nội",
    "Xe Limousine đi Sapa từ Hà Nội",
    "Xe Limousine đi Quảng Ninh từ Hà Nội",
  ];

  const stations = [
    "Bến xe Miền Đông",
    "Bến xe Trung tâm Đà Nẵng",
    "Bến xe Gia Lâm",
    "Bến xe Mỹ Đình",
    "Bến xe An Sương",
    "Bến xe Nước Ngầm",
    "Bến xe Miền Tây",
  ];

  const operators = [
    "Xe Hải Âu",
    "Xe Chín Nghĩa",
    "Xe Hưng Long",
    "Xe Kim Mạnh Hùng",
    "Xe Tuấn Hưng",
    "Xe Khánh Phong",
    "Xe An Phú (Quê Hương)",
    "Xe Minh Quốc",
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-links-grid">
          <div className="footer-column">
            <h3 className="footer-title">Tin tức</h3>
            <ul className="footer-links">
              {news.map((item, i) => (
                <li key={i}>
                  <a href="#">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Tuyến đường</h3>
            <ul className="footer-links">
              {routes.map((item, i) => (
                <li key={i}>
                  <a href="#">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Xe Limousine</h3>
            <ul className="footer-links">
              {limousines.map((item, i) => (
                <li key={i}>
                  <a href="#">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-meta-grid">
          <div className="footer-column">
            <h3 className="footer-title">Bến xe</h3>
            <ul className="footer-links">
              {stations.map((item, i) => (
                <li key={i}>
                  <a href="#">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Nhà xe</h3>
            <ul className="footer-links">
              {operators.map((item, i) => (
                <li key={i}>
                  <a href="#">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-column">
            <ul className="footer-links">
              {operators.map((item, i) => (
                <li key={i}>
                  <a href="#">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-column">
            <ul className="footer-links">
              {operators.map((item, i) => (
                <li key={i}>
                  <a href="#">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Về Chúng Tôi</h3>
            <ul className="footer-links">
              <li>
                <a href="#">Giới Thiệu Vivutoday</a>
              </li>
              <li>
                <a href="#">Liên Hệ</a>
              </li>
              <li>
                <a href="#">Giá trị cốt lõi</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Hỗ Trợ</h3>
            <ul className="footer-links">
              <li>
                <a href="#">Chính sách bảo mật</a>
              </li>
              <li>
                <a href="#">Chính sách điều khoản & giao dịch</a>
              </li>
              <li>
                <a href="#">Chính sách đổi trả và hoàn tiền</a>
              </li>
              <li>
                <a href="#">Chính sách thanh toán</a>
              </li>
              <li>
                <a href="#">Quy chế hoạt động</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Liên hệ</h3>
            <div className="contact-block">
              <div className="hotline">
                Hotline: <strong>1900 0152</strong>
              </div>
              <div className="hotline-note">(Cước phí: 3.000 đ/phút)</div>
            </div>
            <div className="contact-block">
              <div className="hotline">
                Hotline: <strong>0909.696.678</strong>
              </div>
              <div className="hotline-note">(Cước phí: 1.000 đ/phút)</div>
            </div>
            <div className="contact-block">
              <div className="hotline">
                Hotline: <strong>1900.0179</strong>
              </div>
              <div className="hotline-note">
                (Cước phí: 8.000 đ/phút – dịch vụ đặt vé nhanh 24/7)
              </div>
            </div>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Chứng nhận</h3>
            <div className="cert-logos">
              <img src="/dmca.png" alt="DMCA" />
              <img src="/dmca.png" alt="SSL" />
              <img src="/dmca.png" alt="Bộ Công Thương" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
