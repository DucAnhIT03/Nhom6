import TopHeader from '../../../shared/components/header/TopHeader';
import NavigationBar from '../../../shared/components/header/NavigationBar';
import HeroSection from '../components/hero/HeroSection';
import PopularRoutes from '../components/popular-routes/PopularRoutes';
import FeaturedOffers from '../components/feature-offer/FeaturedOffers';
import PopularBusOperators from '../components/bus-operation/PopularBusOperators';
import TopReviews from '../components/top-reviews/TopReviews';
import PopularBusStations from '../components/bus-station/PopularBusStations';
import PlatformFeatures from '../components/platform/PlatformFeatures';
import MediaMentions from '../components/media/MediaMentions';
import Footer from '../../../shared/components/footer/Footer';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <TopHeader />
      <NavigationBar />
      <HeroSection />
      <PopularRoutes />
      <FeaturedOffers />
      <PopularBusOperators />
      <TopReviews />
      <PopularBusStations />
      <PlatformFeatures />
      <MediaMentions />
      <Footer />
    </div>
  );
};

export default HomePage;


