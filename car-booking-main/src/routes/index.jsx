import { Routes, Route } from "react-router-dom";
import HomePage from "../features/home/pages/HomePage";
import IntroPage from "../features/intro/pages/IntroPage";
import PostPage from "../features/post/pages/PostPage";
import NotFoundPage from "../features/404/NotFoundPage";
import BusStations from "../features/bus-station/pages/BusStations";
import BusStationDetail from "../features/bus-station/pages/BusStationDetail";
import GaragePage from "../features/garage/pages/GaragePage";
import BusCompanyDetail from "../features/garage/pages/BusCompanyDetail";
import RoutesPage from "../features/routes/pages/RoutesPage";
import RouteDetail from "../features/routes/pages/RouteDetail";
import CheckTicket from "../features/check-ticket/pages/CheckTicket";
import BookTicket from "../features/book-ticket/pages/BookTicket";
import CheckoutPage from "../features/book-ticket/pages/CheckoutPage";
import VnpayReturn from "../features/book-ticket/pages/VnpayReturn";
import Login from "../features/auth/pages/Login/Login";
import Register from "../features/auth/pages/Register/Register";
import ProfilePage from "../features/profile/pages/ProfilePage";
import BookingHistory from "../features/booking-history/pages/BookingHistory";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/introduce" element={<IntroPage />} />
      <Route path="/post" element={<PostPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/booking-history" element={<BookingHistory />} />
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/bus-station" element={<BusStations />} />
      <Route path="/bus-station/:id" element={<BusStationDetail />} />
      <Route path="/garage" element={<GaragePage />} />
      <Route path="/garage/:id" element={<BusCompanyDetail />} />
      <Route path="/routes" element={<RoutesPage />} />
      <Route path="/routes/:id" element={<RouteDetail />} />
      <Route path="/check-ticket" element={<CheckTicket />} />
      <Route path="/book-ticket" element={<BookTicket />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/vnpay-return" element={<VnpayReturn />} />
    </Routes>
  );
}

export default AppRouter;
