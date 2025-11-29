import { useEffect, useState, useMemo } from "react";
import SearchForm from "../search-form/SearchForm";
import { getHeroBanners } from "../../../../services/bannerService";
import "./HeroSection.css";

const HeroSection = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchBanner = async () => {
      try {
        const result = await getHeroBanners(5, "HOME_TOP");
        if (mounted) {
          setBanners(result || []);
          setCurrentIndex(0);
        }
      } catch (error) {
        console.error("Không thể tải banner:", error);
      }
    };

    fetchBanner();

    return () => {
      mounted = false;
    };
  }, []);

  // Tự động chuyển banner
  useEffect(() => {
    if (!banners.length) return;
    if (isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // 5s đổi 1 banner

    return () => clearInterval(interval);
  }, [banners, isHovered]);

  const currentBanner = useMemo(() => {
    if (!banners.length) return null;
    return banners[currentIndex % banners.length]?.bannerUrl || null;
  }, [banners, currentIndex]);

  const prevBanner = () => {
    if (!banners.length) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextBanner = () => {
    if (!banners.length) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div
      className="hero-section"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <div className={`hero-background ${currentBanner ? "" : "no-banner"}`}>
        {currentBanner && (
          <img
            key={currentIndex}
            src={currentBanner}
            alt="banner"
            className="hero-banner-image"
          />
        )}

        {banners.length > 1 && (
          <>
            <button
              className="hero-nav hero-nav--left"
              onClick={prevBanner}
              aria-label="Banner trước"
            >
              ‹
            </button>
            <button
              className="hero-nav hero-nav--right"
              onClick={nextBanner}
              aria-label="Banner tiếp"
            >
              ›
            </button>
          </>
        )}
      </div>

      <div className="hero-content">
        <div className="inside">
          <div className="hero-center">
            <SearchForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

