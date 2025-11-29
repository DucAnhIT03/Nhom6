import React, { useEffect, useState } from "react";
import BusCard from "../components/BusCard";
import Pagination from "../../../shared/components/pagination/Pagination";
import TopHeader from "../../../shared/components/header/TopHeader";
import NavigationBar from "../../../shared/components/header/NavigationBar";
import Footer from "../../../shared/components/footer/Footer";
import { getRoutes } from "../../../services/routeService";
import { getSeatTypePrices } from "../../../services/seatTypePriceService";
import "./RoutesPage.css";

const LIMIT = 8;

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [routePrices, setRoutePrices] = useState({}); // Map routeId -> minPrice

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

        // Lấy giá vé thấp nhất cho mỗi route
        if (items.length > 0) {
          const pricesMap = {};
          await Promise.all(
            items.map(async (route) => {
              try {
                const basePrice = typeof route.price === 'number' ? route.price : 0;
                const companyId = route.busCompanyId || route.busCompany?.id;
                
                if (route.id) {
                  const seatPrices = await getSeatTypePrices({
                    routeId: route.id,
                    companyId: companyId,
                  });

                  let minPrice = basePrice;
                  
                  if (seatPrices && seatPrices.length > 0) {
                    // Tìm giá ghế STANDARD trước
                    const standardPrice = seatPrices.find(
                      price => price.seatType === 'STANDARD' || price.seat_type === 'STANDARD'
                    );
                    
                    if (standardPrice) {
                      const seatPrice = Number(standardPrice.price) || 0;
                      minPrice = basePrice + seatPrice;
                    } else {
                      // Nếu không có STANDARD, lấy giá thấp nhất
                      const prices = seatPrices
                        .map(price => Number(price.price) || 0)
                        .filter(price => price > 0);
                      
                      if (prices.length > 0) {
                        const minSeatPrice = Math.min(...prices);
                        minPrice = basePrice + minSeatPrice;
                      }
                    }
                  }
                  
                  pricesMap[route.id] = minPrice > 0 ? minPrice : null;
                }
              } catch (err) {
                console.warn(`Error loading price for route ${route.id}:`, err);
                pricesMap[route.id] = null;
              }
            })
          );
          
          if (isMounted) {
            setRoutePrices(pricesMap);
          }
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
                <BusCard 
                  key={route.id} 
                  route={route} 
                  minPrice={routePrices[route.id]}
                />
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
