import "./FeaturedOffers.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const FeaturedOffers = () => {
  return (
    <section className="featured-offers">
      <div className="section-container">
        <h2 className="section-title">Ưu Đãi Nổi Bật</h2>

        <button className="control-btn left">
          <FaChevronLeft size={18} />
        </button>

        <button className="control-btn right">
          <FaChevronRight size={18} />
        </button>

        <div className="offer-content">
          <img src="/banner2.png" alt="" />
        </div>
      </div>
    </section>
  );
};

export default FeaturedOffers;

