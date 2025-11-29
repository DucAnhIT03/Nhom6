import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopHeader from "../../../shared/components/header/TopHeader";
import NavigationBar from "../../../shared/components/header/NavigationBar";
import Footer from "../../../shared/components/footer/Footer";
import "./CheckoutPage.css";
import axiosClient from "../../../services/axiosClient";

function formatCurrency(amount) {
  if (!amount || Number.isNaN(Number(amount))) return "0₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const { schedule, seats = [], seatDetails = [] } = state;

  const totalPrice = useMemo(
    () =>
      seatDetails.reduce(
        (sum, seat) => sum + (Number(seat.priceForSeatType) || 0),
        0
      ),
    [seatDetails]
  );

  useEffect(() => {
    if (!schedule || !seats.length) {
      navigate("/book-ticket", { replace: true });
    }
  }, [schedule, seats.length, navigate]);

  if (!schedule || !seats.length) {
    return null;
  }

  const departureTime = schedule?.departureTime
    ? new Date(schedule.departureTime).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  const handlePayWithVnpay = async () => {
    try {
      const res = await axiosClient.post("/payments/vnpay/create", {
        amount: totalPrice,
        orderId: `SCH${schedule.id}-${Date.now()}`,
        orderInfo: `Thanh toán vé xe - chuyến ${schedule.route?.departureStation?.name} → ${schedule.route?.arrivalStation?.name}, ghế: ${seatDetails
          .map((s) => s.label || s.seatNumber)
          .join(", ")}`,
      });

      const data = res?.data || res;
      const url = data?.paymentUrl;
      if (url) {
        window.location.href = url;
      } else {
        alert("Không lấy được link thanh toán VNPAY");
      }
    } catch (error) {
      console.error("VNPAY error:", error);
      alert(
        error?.response?.data?.message ||
          "Không thể tạo thanh toán VNPAY. Vui lòng thử lại."
      );
    }
  };

  return (
    <div className="checkout-page">
      <TopHeader />
      <NavigationBar />

      <main className="checkout-main">
        <section className="checkout-info">
          <h2>Thông tin chuyến đi</h2>
          <div className="checkout-card">
            <div className="checkout-row">
              <span className="label">Tuyến</span>
              <span className="value">
                {schedule?.route?.departureStation?.name} →{" "}
                {schedule?.route?.arrivalStation?.name}
              </span>
            </div>
            <div className="checkout-row">
              <span className="label">Ngày giờ khởi hành</span>
              <span className="value">{departureTime}</span>
            </div>
            <div className="checkout-row">
              <span className="label">Nhà xe</span>
              <span className="value">
              {schedule?.bus?.company?.name ||
                schedule?.route?.busCompany?.name ||
                schedule?.busCompany?.name ||
                schedule?.busCompanyName ||
                "-"}
              </span>
            </div>
            <div className="checkout-row">
              <span className="label">Xe</span>
              <span className="value">
                {schedule?.bus?.name || schedule?.busName}
              </span>
            </div>
            <div className="checkout-row">
              <span className="label">Ghế đã chọn</span>
              <span className="value">
                {seatDetails.map((s) => s.label || s.seatNumber).join(", ")}
              </span>
            </div>
          </div>

          <h3>Thông tin thanh toán</h3>
          <div className="checkout-card">
            <div className="checkout-table">
              <div className="checkout-table-header">
                <span>Danh mục</span>
                <span>Số lượng</span>
                <span>Đơn giá</span>
                <span>Thành tiền</span>
              </div>
              {seatDetails.map((seat) => {
                const price = Number(seat.priceForSeatType) || 0;
                return (
                  <div
                    className="checkout-table-row"
                    key={seat.id || seat.seatNumber}
                  >
                    <span>Ghế {seat.label || seat.seatNumber}</span>
                    <span>1</span>
                    <span>{formatCurrency(price)}</span>
                    <span>{formatCurrency(price)}</span>
                  </div>
                );
              })}
              <div className="checkout-table-footer">
                <span>Tổng cộng</span>
                <span>{seats.length}</span>
                <span />
                <span className="total">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="checkout-payment">
          <h2>Phương thức thanh toán</h2>
          <div className="checkout-card">
            <div className="payment-option active">
              <div className="payment-logo">
                <svg width="140" height="50" viewBox="0 0 200 70" xmlns="http://www.w3.org/2000/svg">
                  {/* Red rectangle background */}
                  <rect x="5" y="10" width="50" height="50" rx="8" fill="#E31E24" transform="rotate(-5 30 35)"/>
                  {/* Blue rectangle with circle pattern */}
                  <rect x="0" y="5" width="50" height="50" rx="8" fill="#0066CC" transform="rotate(5 25 30)"/>
                  <circle cx="25" cy="30" r="12" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.8"/>
                  <circle cx="25" cy="30" r="8" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6"/>
                  <circle cx="25" cy="30" r="4" fill="#FFFFFF" opacity="0.7"/>
                  {/* VNPAY text */}
                  <text x="70" y="35" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#E31E24" letterSpacing="2">VN</text>
                  <text x="120" y="35" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#0066CC" letterSpacing="2">PAY</text>
                  {/* Slogan */}
                  <text x="100" y="52" fontFamily="Arial, sans-serif" fontSize="10" fill="#9CA3AF" textAnchor="middle">Cho cuộc sống đơn giản hơn</text>
                </svg>
              </div>
              <div className="payment-info">
                <span className="payment-name">VNPAY</span>
                <span className="payment-desc">
                  Thanh toán an toàn qua cổng VNPAY
                </span>
              </div>
            </div>

            <div className="payment-summary">
              <div className="payment-row">
                <span>Thành tiền</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="payment-row">
                <span>Phí thanh toán</span>
                <span>0₫</span>
              </div>
              <div className="payment-row total">
                <span>Tổng cộng</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePayWithVnpay}
              className="payment-submit-btn"
            >
              <span className="payment-btn-content">
                <svg width="70" height="25" viewBox="0 0 200 70" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
                  {/* Red rectangle background */}
                  <rect x="5" y="10" width="50" height="50" rx="8" fill="#FFFFFF" opacity="0.3" transform="rotate(-5 30 35)"/>
                  {/* Blue rectangle with circle pattern */}
                  <rect x="0" y="5" width="50" height="50" rx="8" fill="#FFFFFF" opacity="0.3" transform="rotate(5 25 30)"/>
                  <circle cx="25" cy="30" r="12" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.4"/>
                  <circle cx="25" cy="30" r="8" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.3"/>
                  <circle cx="25" cy="30" r="4" fill="#FFFFFF" opacity="0.5"/>
                  {/* VNPAY text */}
                  <text x="70" y="35" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#FFFFFF" letterSpacing="1.5">VN</text>
                  <text x="120" y="35" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#FFFFFF" letterSpacing="1.5">PAY</text>
                </svg>
                Thanh toán VNPAY
              </span>
            </button>
            <button
              type="button"
              className="payment-back-btn"
              onClick={() => navigate(-1)}
            >
              Quay lại
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;


