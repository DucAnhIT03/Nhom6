import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopHeader from "../../../shared/components/header/TopHeader";
import NavigationBar from "../../../shared/components/header/NavigationBar";
import Footer from "../../../shared/components/footer/Footer";
import SeatSelectionModal from "../../book-ticket/components/SeatSelectionModal";
import { getRouteById } from "../../../services/routeService";
import { getSchedules } from "../../../services/scheduleService";
import { getSeatTypePrices } from "../../../services/seatTypePriceService";
import { RiRoadMapFill, RiCalendarFill, RiTimeFill, RiBusFill } from "react-icons/ri";
import "./RouteDetail.css";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export default function RouteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [seatTypePrices, setSeatTypePrices] = useState([]);

  useEffect(() => {
    const fetchRouteDetail = async () => {
      if (!id) {
        setError("Không tìm thấy tuyến đường");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const routeData = await getRouteById(id);
        setRoute(routeData);

        // Lấy giá vé theo loại ghế
        if (routeData?.id) {
          try {
            const companyId = routeData.busCompanyId || routeData.busCompany?.id;
            const prices = await getSeatTypePrices({
              routeId: routeData.id,
              companyId: companyId,
            });
            setSeatTypePrices(prices || []);
          } catch (priceError) {
            console.warn('Error loading seat type prices:', priceError);
            setSeatTypePrices([]);
          }

          // Lấy danh sách schedules của tuyến này
          const schedulesData = await getSchedules({
            routeId: routeData.id,
            page: 1,
            limit: 100,
            status: "AVAILABLE",
          });
          setSchedules(schedulesData.items || []);
        }
      } catch (err) {
        console.error('Error loading route detail:', err);
        setError(
          err.response?.data?.message ||
          err.message ||
          "Không thể tải thông tin tuyến đường. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRouteDetail();
  }, [id]);

  const handleOpenSeatModal = (schedule) => {
    setActiveSchedule(schedule);
    setSeatModalOpen(true);
  };

  const handleCloseSeatModal = () => {
    setSeatModalOpen(false);
    setActiveSchedule(null);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Tính giá vé thấp nhất (ưu tiên ghế thường STANDARD)
  const calculateMinPrice = () => {
    if (!route) return null;
    
    const basePrice = typeof route.price === 'number' ? route.price : 0;
    
    if (seatTypePrices.length === 0) {
      return basePrice > 0 ? basePrice : null;
    }

    // Tìm giá ghế STANDARD trước
    const standardPrice = seatTypePrices.find(
      price => price.seatType === 'STANDARD' || price.seat_type === 'STANDARD'
    );
    
    if (standardPrice) {
      const seatPrice = Number(standardPrice.price) || 0;
      return basePrice + seatPrice;
    }

    // Nếu không có STANDARD, lấy giá thấp nhất
    const prices = seatTypePrices
      .map(price => Number(price.price) || 0)
      .filter(price => price > 0);
    
    if (prices.length > 0) {
      const minSeatPrice = Math.min(...prices);
      return basePrice + minSeatPrice;
    }

    return basePrice > 0 ? basePrice : null;
  };

  if (loading) {
    return (
      <>
        <TopHeader />
        <NavigationBar />
        <div className="route-detail-container">
          <div className="loading-container">
            <p>Đang tải thông tin tuyến đường...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !route) {
    return (
      <>
        <TopHeader />
        <NavigationBar />
        <div className="route-detail-container">
          <div className="error-container">
            <p>{error || "Không tìm thấy thông tin tuyến đường"}</p>
            <button onClick={() => navigate("/routes")} className="back-button">
              Quay lại danh sách tuyến đường
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const departure = route.departureStation?.name || "Đang cập nhật";
  const arrival = route.arrivalStation?.name || "Đang cập nhật";
  const companyName = route.busCompany?.companyName || "Nhà xe đang cập nhật";
  const price = typeof route.price === "number" && !Number.isNaN(route.price)
    ? currency.format(route.price)
    : "Liên hệ";

  return (
    <>
      <TopHeader />
      <NavigationBar />
      <div className="route-detail-container">
        <button onClick={() => navigate("/routes")} className="back-button">
          ← Quay lại danh sách tuyến đường
        </button>

        <div className="route-detail-header">
          <h1 className="route-detail-title">
            <RiRoadMapFill />
            {departure} → {arrival}
          </h1>
          <div className="route-detail-meta">
            <span className="route-company">
              <RiBusFill />
              {companyName}
            </span>
            {route.distance && (
              <span className="route-distance">
                Khoảng cách: {route.distance} km
              </span>
            )}
            {route.duration && (
              <span className="route-duration">
                Thời gian: {Math.floor(route.duration / 60)}h {route.duration % 60}phút
              </span>
            )}
            <span className="route-price">
              Giá từ: <strong>{price}</strong>
            </span>
          </div>
        </div>

        <div className="route-detail-content">
          <div className="schedules-section">
            <h2 className="schedules-title">
              <RiCalendarFill />
              Các chuyến xe khả dụng
            </h2>

            {schedules.length === 0 ? (
              <div className="empty-schedules">
                <p>Hiện tại chưa có chuyến xe nào cho tuyến đường này.</p>
                <p className="empty-schedules-note">
                  Vui lòng quay lại sau hoặc liên hệ nhà xe để biết thêm thông tin.
                </p>
              </div>
            ) : (
              <div className="schedules-list">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="schedule-card">
                    <div className="schedule-info">
                      <div className="schedule-time">
                        <div className="time-item">
                          <RiTimeFill />
                          <div>
                            <strong>Khởi hành</strong>
                            <span>{formatDateTime(schedule.departureTime)}</span>
                          </div>
                        </div>
                        <div className="time-arrow">→</div>
                        <div className="time-item">
                          <RiTimeFill />
                          <div>
                            <strong>Đến nơi</strong>
                            <span>{formatDateTime(schedule.arrivalTime)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="schedule-details">
                        <div className="detail-item">
                          <span className="detail-label">Nhà xe:</span>
                          <span className="detail-value">
                            {schedule.bus?.company?.name || 
                             schedule.bus?.company?.companyName || 
                             schedule.route?.busCompany?.companyName || 
                             route.busCompany?.companyName || 
                             "N/A"}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Xe:</span>
                          <span className="detail-value">
                            {schedule.bus?.name || "N/A"} {schedule.bus?.licensePlate || schedule.bus?.license_plate ? `(${schedule.bus?.licensePlate || schedule.bus?.license_plate})` : ''}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Giá vé:</span>
                          <span className="detail-value price-value">
                            {(() => {
                              const minPrice = calculateMinPrice();
                              return minPrice && minPrice > 0
                                ? currency.format(minPrice)
                                : "Liên hệ";
                            })()}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Ghế trống:</span>
                          <span className="detail-value available-seats">
                            {schedule.availableSeat || schedule.available_seat || 0} / {schedule.totalSeats || schedule.total_seats || 0}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Ngày khởi hành:</span>
                          <span className="detail-value">
                            {formatDate(schedule.departureTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="schedule-actions">
                      <button
                        className="book-button"
                        onClick={() => handleOpenSeatModal({
                          ...schedule,
                          routeId: schedule.routeId || route.id,
                          route: route,
                        })}
                        disabled={!schedule.availableSeat || schedule.availableSeat === 0 || !schedule.busId}
                      >
                        Đặt vé
                      </button>
                      {(!schedule.availableSeat || schedule.availableSeat === 0) && (
                        <span className="full-seats">Hết chỗ</span>
                      )}
                      {!schedule.busId && (
                        <span className="full-seats">Chưa có thông tin xe</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <SeatSelectionModal
        isOpen={seatModalOpen}
        schedule={activeSchedule}
        onClose={handleCloseSeatModal}
      />
    </>
  );
}

