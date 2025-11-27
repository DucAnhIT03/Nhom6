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
              Thanh toán VNPAY
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


