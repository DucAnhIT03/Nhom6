import TopHeader from "../../../shared/components/header/TopHeader";
import NavigationBar from "../../../shared/components/header/NavigationBar";
import Footer from "../../../shared/components/footer/Footer";
import IntroHero from "../components/intro-hero/IntroHero";
import FeatureCard from "../components/features-card/FeatureCard";
import WhyChooseUs from "../components/why-choose-us/WhyChooseUs";
import CustomerFirst from "../components/customer/CustomerFirst";
import ContactForm from "../components/contact-form/ContactForm";
import "./IntroPage.css";

export default function IntroPage() {
  return (
    <>
      <TopHeader />
      <NavigationBar />
      <IntroHero />
      <div className="intro-container">
        <FeatureCard />
        <WhyChooseUs />
        <CustomerFirst />
        <ContactForm />
      </div>
      <Footer />
    </>
  );
}
