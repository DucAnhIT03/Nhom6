import { useEffect, useState, useMemo } from "react";
import "./FeaturedOffers.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getHeroBanners } from "../../../../services/bannerService";

const FeaturedOffers = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchBanners = async () => {
      try {
        const result = await getHeroBanners(5, "FEATURED_OFFERS");
        if (mounted) {
          setBanners(result || []);
          setCurrentIndex(0);
        }
      } catch (error) {
        console.error("Không thể tải banner ưu đãi:", error);
      }
    };

    fetchBanners();

    return () => {
      mounted = false;
    };
  }, []);

  const currentBanner = useMemo(() => {
    if (!banners.length) return null;
    return banners[currentIndex % banners.length]?.bannerUrl || null;
  }, [banners, currentIndex]);

  useEffect(() => {
    if (!banners.length) return;
    if (isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners, isHovered]);

  const prev = () => {
    if (!banners.length) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const next = () => {
    if (!banners.length) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (!banners.length) {
    return null;
  }

  return (
    <section
      className="featured-offers"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <div className="section-container">
        <h2 className="section-title">Ưu Đãi Nổi Bật</h2>

        <button className="control-btn left" onClick={prev}>
          <FaChevronLeft size={18} />
        </button>

        <button className="control-btn right" onClick={next}>
          <FaChevronRight size={18} />
        </button>

        <div className="offer-content">
          {currentBanner && (
            <img
              src={currentBanner}
              alt="ưu đãi nổi bật"
              className="featured-offer-image"
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedOffers;

