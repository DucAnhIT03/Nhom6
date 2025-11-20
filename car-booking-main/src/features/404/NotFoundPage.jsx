import { Link } from "react-router-dom";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1>404</h1>
        <h2>Trang bạn tìm không tồn tại</h2>
        <p>
          Có vẻ như bạn đã đi lạc. Liên kết bạn truy cập không tồn tại hoặc đã
          bị thay đổi.
        </p>

        <Link to="/" className="go-home-btn">
          Quay về trang chủ
        </Link>
      </div>

      <div className="notfound-image">
        <img src="/404.png" alt="404 Illustration" />
      </div>
    </div>
  );
}
