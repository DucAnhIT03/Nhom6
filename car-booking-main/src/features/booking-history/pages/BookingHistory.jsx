import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopHeader from "../../../shared/components/header/TopHeader";
import NavigationBar from "../../../shared/components/header/NavigationBar";
import Footer from "../../../shared/components/footer/Footer";
import ticketService from "../../../services/ticketService";
import "./BookingHistory.css";

function formatCurrency(amount) {
  if (!amount || Number.isNaN(Number(amount))) return "0₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const BookingHistory = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await ticketService.getMyTickets();
        // Handle both array and object with data property
        const ticketsData = Array.isArray(response) ? response : response?.data || [];
        setTickets(ticketsData);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError(err?.response?.data?.message || "Không thể tải lịch sử đặt vé");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleCancelTicket = async (ticketId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy vé này không?")) {
      return;
    }

    try {
      await ticketService.cancelTicket(ticketId);
      // Refresh the list
      const response = await ticketService.getMyTickets();
      const ticketsData = Array.isArray(response) ? response : response?.data || [];
      setTickets(ticketsData);
      alert("Hủy vé thành công");
    } catch (err) {
      console.error("Error canceling ticket:", err);
      alert(err?.response?.data?.message || "Không thể hủy vé. Vui lòng thử lại.");
    }
  };

  const getStatusBadge = (status) => {
    if (status === "BOOKED") {
      return <span className="status-badge status-booked">Đã đặt</span>;
    } else if (status === "CANCELLED") {
      return <span className="status-badge status-cancelled">Đã hủy</span>;
    }
    return <span className="status-badge">{status}</span>;
  };

  if (loading) {
    return (
      <>
        <TopHeader />
        <NavigationBar />
        <div className="booking-history-container">
          <div className="loading">Đang tải...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <TopHeader />
        <NavigationBar />
        <div className="booking-history-container">
          <div className="error-message">{error}</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <TopHeader />
      <NavigationBar />
      <div className="booking-history-container">
        <div className="booking-history-content">
          <h1 className="page-title">Lịch sử đặt vé</h1>

          {tickets.length === 0 ? (
            <div className="empty-state">
              <p>Bạn chưa có vé nào.</p>
              <button
                className="btn-primary"
                onClick={() => navigate("/book-ticket")}
              >
                Đặt vé ngay
              </button>
            </div>
          ) : (
            <div className="tickets-list">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="ticket-card">
                  <div className="ticket-header">
                    <div className="ticket-code">
                      <span className="label">Mã vé:</span>
                      <span className="value">{ticket.ticketCode || `#${ticket.id}`}</span>
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>

                  <div className="ticket-body">
                    <div className="ticket-info-row">
                      <div className="info-item">
                        <span className="info-label">Tuyến đường:</span>
                        <span className="info-value">
                          {ticket.schedule?.route?.departureStation?.name || "N/A"} →{" "}
                          {ticket.schedule?.route?.arrivalStation?.name || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="ticket-info-row">
                      <div className="info-item">
                        <span className="info-label">Ngày giờ khởi hành:</span>
                        <span className="info-value">
                          {formatDateTime(ticket.departureTime || ticket.schedule?.departureTime)}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Ngày giờ đến:</span>
                        <span className="info-value">
                          {formatDateTime(ticket.arrivalTime || ticket.schedule?.arrivalTime)}
                        </span>
                      </div>
                    </div>

                    <div className="ticket-info-row">
                      <div className="info-item">
                        <span className="info-label">Nhà xe:</span>
                        <span className="info-value">
                          {ticket.schedule?.bus?.company?.name ||
                            ticket.schedule?.route?.busCompany?.name ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Xe:</span>
                        <span className="info-value">
                          {ticket.schedule?.bus?.name || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="ticket-info-row">
                      <div className="info-item">
                        <span className="info-label">Ghế:</span>
                        <span className="info-value">
                          {ticket.seat?.seatNumber || "N/A"} ({ticket.seatType || ticket.seat?.seatType || "N/A"})
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Giá vé:</span>
                        <span className="info-value price">
                          {formatCurrency(ticket.price)}
                        </span>
                      </div>
                    </div>

                    <div className="ticket-info-row">
                      <div className="info-item">
                        <span className="info-label">Ngày đặt:</span>
                        <span className="info-value">
                          {formatDateTime(ticket.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {ticket.status === "BOOKED" && (
                    <div className="ticket-actions">
                      <button
                        className="btn-cancel"
                        onClick={() => handleCancelTicket(ticket.id)}
                      >
                        Hủy vé
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BookingHistory;



