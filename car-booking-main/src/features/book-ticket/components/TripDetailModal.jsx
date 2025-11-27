import { IoClose } from "react-icons/io5";
import "./TripDetailModal.css";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const formatTime = (value) => {
  if (!value) return "--:--";
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (minutes) => {
  if (!minutes || Number.isNaN(minutes)) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours && mins) return `${hours}h ${mins}'`;
  if (hours) return `${hours}h`;
  return `${mins}'`;
};

export default function TripDetailModal({ isOpen, onClose, schedule }) {
  if (!isOpen || !schedule) return null;

  const bus = schedule.bus || {};
  const route = schedule.route || {};
  const departureStation = route?.departureStation?.name || "Đang cập nhật";
  const arrivalStation = route?.arrivalStation?.name || "Đang cập nhật";
  const companyName =
    bus?.company?.name ||
    bus?.company?.companyName ||
    route?.busCompany?.companyName ||
    "Nhà xe đang cập nhật";
  const busName = bus?.name || companyName;
  const licensePlate = bus?.licensePlate || "N/A";
  const departureTimeLabel = formatTime(schedule.departureTime);
  const arrivalTimeLabel = formatTime(schedule.arrivalTime);
  const durationMinutes =
    route?.duration ||
    (schedule.departureTime && schedule.arrivalTime
      ? Math.max(
          Math.round(
            (new Date(schedule.arrivalTime) -
              new Date(schedule.departureTime)) /
              60000
          ),
          0
        )
      : null);
  const durationLabel = formatDuration(durationMinutes);
  const availableSeats =
    typeof schedule.availableSeat === "number" ? schedule.availableSeat : 0;
  const totalSeats =
    typeof schedule.totalSeats === "number" ? schedule.totalSeats : 0;
  const departureDate = schedule.departureTime
    ? new Date(schedule.departureTime).toLocaleDateString("vi-VN")
    : "Đang cập nhật";

  return (
    <div className="trip-detail-modal-overlay" onClick={onClose}>
      <div className="trip-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="trip-detail-modal-header">
          <h2>Thông tin chi tiết chuyến xe</h2>
          <button
            className="trip-detail-modal-close"
            onClick={onClose}
            type="button"
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="trip-detail-modal-content">
          <div className="trip-detail-section">
            <h3>Thông tin nhà xe</h3>
            <div className="trip-detail-row">
              <span className="trip-detail-label">Nhà xe:</span>
              <span className="trip-detail-value">{companyName}</span>
            </div>
            <div className="trip-detail-row">
              <span className="trip-detail-label">Tên xe:</span>
              <span className="trip-detail-value">{busName}</span>
            </div>
            <div className="trip-detail-row">
              <span className="trip-detail-label">Biển số:</span>
              <span className="trip-detail-value">{licensePlate}</span>
            </div>
          </div>

          <div className="trip-detail-section">
            <h3>Thông tin chuyến đi</h3>
            <div className="trip-detail-row">
              <span className="trip-detail-label">Tuyến đường:</span>
              <span className="trip-detail-value">
                {departureStation} → {arrivalStation}
              </span>
            </div>
            <div className="trip-detail-row">
              <span className="trip-detail-label">Ngày khởi hành:</span>
              <span className="trip-detail-value">{departureDate}</span>
            </div>
            <div className="trip-detail-row">
              <span className="trip-detail-label">Giờ khởi hành:</span>
              <span className="trip-detail-value">{departureTimeLabel}</span>
            </div>
            <div className="trip-detail-row">
              <span className="trip-detail-label">Giờ đến dự kiến:</span>
              <span className="trip-detail-value">{arrivalTimeLabel}</span>
            </div>
            <div className="trip-detail-row">
              <span className="trip-detail-label">Thời gian di chuyển:</span>
              <span className="trip-detail-value">{durationLabel}</span>
            </div>
          </div>

          <div className="trip-detail-section">
            <h3>Thông tin ghế</h3>
            <div className="trip-detail-row">
              <span className="trip-detail-label">Tổng số ghế:</span>
              <span className="trip-detail-value">{totalSeats} ghế</span>
            </div>
            <div className="trip-detail-row">
              <span className="trip-detail-label">Ghế còn trống:</span>
              <span className="trip-detail-value">
                {availableSeats > 0 ? `${availableSeats} ghế` : "Hết chỗ"}
              </span>
            </div>
          </div>
        </div>

        <div className="trip-detail-modal-footer">
          <button
            className="trip-detail-modal-btn"
            onClick={onClose}
            type="button"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

