import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopHeader from "../../../shared/components/header/TopHeader";
import NavigationBar from "../../../shared/components/header/NavigationBar";
import Footer from "../../../shared/components/footer/Footer";
import { getBusCompanyById } from "../../../services/busCompanyService";
import { RiMapPinFill, RiPhoneFill, RiMailFill, RiInformationLine } from "react-icons/ri";
import "./BusCompanyDetail.css";

export default function BusCompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompanyDetail = async () => {
      if (!id) {
        setError("Không tìm thấy nhà xe");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const companyData = await getBusCompanyById(id);
        setCompany(companyData);
      } catch (err) {
        console.error('Error loading company detail:', err);
        setError(
          err.response?.data?.message ||
          err.message ||
          "Không thể tải thông tin nhà xe. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetail();
  }, [id]);

  if (loading) {
    return (
      <>
        <TopHeader />
        <NavigationBar />
        <div className="bus-company-detail-container">
          <div className="loading-container">
            <p>Đang tải thông tin nhà xe...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !company) {
    return (
      <>
        <TopHeader />
        <NavigationBar />
        <div className="bus-company-detail-container">
          <div className="error-container">
            <p>{error || "Không tìm thấy thông tin nhà xe"}</p>
            <button onClick={() => navigate("/garage")} className="back-button">
              Quay lại danh sách nhà xe
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
      <div className="bus-company-detail-container">
        <button onClick={() => navigate("/garage")} className="back-button">
          ← Quay lại danh sách nhà xe
        </button>

        <div className="bus-company-detail-header">
          <h1 className="bus-company-detail-title">{company.name || company.company_name}</h1>
        </div>

        <div className="bus-company-detail-content">
          <div className="bus-company-detail-image-section">
            {company.image ? (
              <img 
                src={company.image} 
                alt={company.name || company.company_name} 
                className="bus-company-detail-image"
              />
            ) : (
              <div className="bus-company-detail-image-placeholder">
                <span>Không có ảnh</span>
              </div>
            )}
          </div>

          <div className="bus-company-detail-info">
            <div className="bus-company-detail-section">
              <h2>
                <RiInformationLine />
                Thông tin nhà xe
              </h2>
              <div className="info-item">
                <strong>Tên nhà xe:</strong>
                <span>{company.name || company.company_name}</span>
              </div>
              {company.address && (
                <div className="info-item">
                  <strong>
                    <RiMapPinFill />
                    Địa chỉ trụ sở:
                  </strong>
                  <span>{company.address}</span>
                </div>
              )}
            </div>

            {company.descriptions && (
              <div className="bus-company-detail-section">
                <h2>Giới thiệu</h2>
                <div className="description-content">
                  {company.descriptions}
                </div>
              </div>
            )}

            <div className="bus-company-detail-section">
              <h2>Thông tin liên hệ</h2>
              <p className="contact-note">
                Để biết thêm thông tin về lịch trình và đặt vé, vui lòng liên hệ qua hệ thống đặt vé hoặc hotline: <strong>1900 0152</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}












