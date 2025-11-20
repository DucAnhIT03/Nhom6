import SearchForm from "../search-form/SearchForm";
import "./HeroSection.css";

const HeroSection = () => {
  return (
    <div className="hero-section">
      <div className="hero-background">
        <img src="/banner.jpg" alt="" />
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

