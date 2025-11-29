import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopHeader from "../../../shared/components/header/TopHeader";
import NavigationBar from "../../../shared/components/header/NavigationBar";
import Footer from "../../../shared/components/footer/Footer";
import { getStationById } from "../../../services/stationService";
import { RiRoadMapFill, RiMapPinFill, RiPhoneFill, RiMailFill } from "react-icons/ri";
import "./BusStationDetail.css";

export default function BusStationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStationDetail = async () => {
      if (!id) {
        setError("Không tìm thấy bến xe");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const response = await getStationById(id);
        // Xử lý response từ backend
        const stationData = response?.success && response?.data 
          ? response.data 
          : response?.data || response;
        setStation(stationData);
      } catch (err) {
        console.error('Error loading station detail:', err);
        setError(
          err.response?.data?.message ||
          err.message ||
          "Không thể tải thông tin bến xe. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStationDetail();
  }, [id]);

  if (loading) {
    return (
      <>
        <TopHeader />
        <NavigationBar />
        <div className="bus-station-detail-container">
          <div className="loading-container">
            <p>Đang tải thông tin bến xe...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !station) {
    return (
      <>
        <TopHeader />
        <NavigationBar />
        <div className="bus-station-detail-container">
          <div className="error-container">
            <p>{error || "Không tìm thấy thông tin bến xe"}</p>
            <button onClick={() => navigate("/bus-station")} className="back-button">
              Quay lại danh sách bến xe
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <TopHeader />
      <NavigationBar />
      <div className="bus-station-detail-container">
        <button onClick={() => navigate("/bus-station")} className="back-button">
          ← Quay lại danh sách bến xe
        </button>

        <div className="bus-station-detail-header">
          <h1 className="bus-station-detail-title">{station.name}</h1>
          {station.location && (
            <div className="bus-station-detail-location">
              <RiMapPinFill />
              <span>{station.location}</span>
            </div>
          )}
        </div>

        <div className="bus-station-detail-content">
          <div className="bus-station-detail-image-section">
            {station.image ? (
              <img 
                src={station.image} 
                alt={station.name} 
                className="bus-station-detail-image"
              />
            ) : (
              <div className="bus-station-detail-image-placeholder">
                <span>Không có ảnh</span>
              </div>
            )}
          </div>

          <div className="bus-station-detail-info">
            <div className="bus-station-detail-section">
              <h2>Thông tin bến xe</h2>
              <div className="info-item">
                <strong>Tên bến xe:</strong>
                <span>{station.name}</span>
              </div>
              {station.address && (
                <div className="info-item">
                  <strong>Địa chỉ:</strong>
                  <span>{station.address}</span>
                </div>
              )}
              {station.province && (
                <div className="info-item">
                  <strong>Tỉnh/Thành phố:</strong>
                  <span>{station.province}</span>
                </div>
              )}
              {station.location && (
                <div className="info-item">
                  <strong>Vị trí:</strong>
                  <span>{station.location}</span>
                </div>
              )}
            </div>

            {station.descriptions && (
              <div className="bus-station-detail-section">
                <h2>Giới thiệu</h2>
                <div className="description-content">
                  {station.descriptions}
                </div>
              </div>
            )}

            <div className="bus-station-detail-section">
              <h2>Liên hệ</h2>
              {station.phone && (
                <div className="contact-item">
                  <RiPhoneFill />
                  <span>{station.phone}</span>
                </div>
              )}
              {station.email && (
                <div className="contact-item">
                  <RiMailFill />
                  <span>{station.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

