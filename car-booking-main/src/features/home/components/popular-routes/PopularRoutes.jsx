import "./PopularRoutes.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const PopularRoutes = () => {
  const routes = [
    { name: "Sài Gòn - Vũng Tàu", price: "150.000", image: "/demo.png" },
    { name: "Sài Gòn - Đà Lạt", price: "250.000", image: "/demo.png" },
    { name: "Sài Gòn - Nha Trang", price: "300.000", image: "/demo.png" },
    { name: "Hà Nội - Hải Phòng", price: "120.000", image: "/demo.png" },
  ];

  return (
    <section className="popular-routes">
      <div className="section-container">
        <h2 className="section-title">Tuyến Đường Phổ Biến</h2>

        <button className="arrow-btn left">
          <FaChevronLeft size={18} />
        </button>
        <button className="arrow-btn right">
          <FaChevronRight size={18} />
        </button>

        <div className="routes-grid">
          {routes.map((route, index) => (
            <div key={index} className="route-card">
              <div className="route-image">
                <img src={route.image} alt={route.name} />
              </div>
              <div className="route-info">
                <h3 className="route-name">{route.name}</h3>
                <p className="route-price">{route.price} đ</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularRoutes;

