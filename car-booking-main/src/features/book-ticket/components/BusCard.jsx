import { IoBus } from "react-icons/io5";

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
  if (hours && mins) return `${hours}h ${mins}’`;
  if (hours) return `${hours}h`;
  return `${mins}’`;
};

export default function BusCard({ schedule, onBookClick }) {
  if (!schedule) return null;

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
  const licensePlate = bus?.licensePlate ? `· ${bus.licensePlate}` : "";
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
  const priceLabel =
    typeof route?.price === "number"
      ? currency.format(route.price)
      : "Liên hệ";
  const availableSeats =
    typeof schedule.availableSeat === "number" ? schedule.availableSeat : 0;
  const totalSeats =
    typeof schedule.totalSeats === "number" ? schedule.totalSeats : 0;
  const cover = bus?.company?.image || "/bus-demo.jpg";

  return (
    <div className="bus-image">
      <img src={cover} className="bus-img" alt={companyName} />

      <div className="bus-info">
        <div className="bus-header">
          <h3>{busName}</h3>
          <span className="rating">
            <IoBus size={14} /> {availableSeats} ghế trống
          </span>
        </div>

        <p className="bus-type">
          {companyName} {licensePlate}
        </p>

        <div className="bus-time">
          <span className="start">{departureTimeLabel}</span>
          <div className="time-arrow">
            <span>{durationLabel}</span>
            <img src="/right-arrow.png" alt="" />
          </div>
          <span className="end">{arrivalTimeLabel}</span>
        </div>

        <div className="location">
          <a>{departureStation}</a>
          <a>{arrivalStation}</a>
        </div>

        <div className="trip-info">
          <p className="trip-note">
            Khởi hành ngày{" "}
            {schedule.departureTime
              ? new Date(schedule.departureTime).toLocaleDateString("vi-VN")
              : "Đang cập nhật"}
          </p>
          <p className="more-info">Thông tin chi tiết</p>
        </div>
      </div>

      <div className="bus-right">
        <p className="price">
          Từ <span>{priceLabel}</span>
        </p>
        <p className="empty">
          Tổng {totalSeats} ghế ·{" "}
          {availableSeats > 0 ? `${availableSeats} còn trống` : "Hết chỗ"}
        </p>
        <button
          className="choose-btn"
          type="button"
          onClick={() => onBookClick?.(schedule)}
        >
          <IoBus />
          Đặt vé
        </button>
      </div>
    </div>
  );
}
