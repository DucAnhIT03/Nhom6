import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopHeader from "../../../shared/components/header/TopHeader";
import NavigationBar from "../../../shared/components/header/NavigationBar";
import Footer from "../../../shared/components/footer/Footer";
import axiosClient from "../../../services/axiosClient";
import "./VnpayReturn.css";

const VnpayReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("Đang xác thực giao dịch...");

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const params = {};
    query.forEach((value, key) => {
      params[key] = value;
    });

    if (!params.vnp_TxnRef) {
      setStatus("error");
      setMessage("Thiếu thông tin giao dịch từ VNPAY.");
      return;
    }

    const verify = async () => {
      try {
        const res = await axiosClient.post("/payments/vnpay/verify", params);
        const data = res?.data || res;
        if (data?.isSuccess) {
          setStatus("success");
          setMessage("Thanh toán thành công! Cảm ơn bạn đã đặt vé.");
        } else {
          setStatus("error");
          setMessage(
            "Thanh toán không thành công hoặc bị hủy. Nếu đã trừ tiền, vui lòng liên hệ hỗ trợ."
          );
        }
      } catch (error) {
        console.error("Verify VNPAY error:", error);
        setStatus("error");
        setMessage(
          error?.response?.data?.message ||
            "Không thể xác thực giao dịch. Vui lòng thử lại sau."
        );
      }
    };

    verify();
  }, [location.search]);

  return (
    <div className="vnpay-return-page">
      <TopHeader />
      <NavigationBar />

      <main className="vnpay-main">
        <div
          className={`vnpay-card ${
            status === "success" ? "success" : status === "error" ? "error" : ""
          }`}
        >
          <h2>
            {status === "pending"
              ? "Đang xử lý thanh toán"
              : status === "success"
              ? "Thanh toán thành công"
              : "Thanh toán thất bại"}
          </h2>
          <p>{message}</p>
          <button
            type="button"
            className="vnpay-back-btn"
            onClick={() => navigate("/")}
          >
            Về trang chủ
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VnpayReturn;


