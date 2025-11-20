import React, { useEffect, useState } from "react";
import BusCard from "../components/BusCard";
import Pagination from "../../../shared/components/pagination/Pagination";
import TopHeader from "../../../shared/components/header/TopHeader";
import NavigationBar from "../../../shared/components/header/NavigationBar";
import Footer from "../../../shared/components/footer/Footer";
import { getRoutes } from "../../../services/routeService";
import "./RoutesPage.css";

const LIMIT = 8;

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchRoutesData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getRoutes({ page: currentPage, limit: LIMIT });
        if (!isMounted) return;
        const items = Array.isArray(response.items) ? response.items : [];
        setRoutes(items);
        setTotalPages(response.totalPages || 1);
        if (response.page && response.page !== currentPage) {
          setCurrentPage(response.page);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to fetch routes:", err);
        setRoutes([]);
        setError("Không thể tải dữ liệu tuyến đường. Vui lòng thử lại sau.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRoutesData();

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  return (
    <>
      <TopHeader />
      <NavigationBar />
      <div className="bus-stations-container">
        <h2 className="bus-stations-title">
          <span>tuyến đường</span>
        </h2>

        {loading && (
          <div className="loading-container">
            <p>Đang tải dữ liệu...</p>
          </div>
        )}

        {!loading && error && (
          <div className="error-state">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && routes.length === 0 && (
          <div className="empty-state">
            <p>Chưa có tuyến đường nào được công bố.</p>
          </div>
        )}

        {!loading && !error && routes.length > 0 && (
          <>
            <div className="bus-stations-grid">
              {routes.map((route) => (
                <BusCard key={route.id} route={route} />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination
                current={currentPage}
                total={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
