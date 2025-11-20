import React, { useState, useEffect } from "react";
import BusCard from "../components/bus-card/BusCard";
import Pagination from "../../../shared/components/pagination/Pagination";
import TopHeader from "../../../shared/components/header/TopHeader";
import NavigationBar from "../../../shared/components/header/NavigationBar";
import Footer from "../../../shared/components/footer/Footer";
import { getStations } from "../../../services/stationService";
import "./BusStations.css";

export default function BusStations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      try {
        const data = await getStations();
        // Đảm bảo data là array
        setStations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading stations:', error);
        setStations([]); // Set empty array nếu có lỗi
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  // Đảm bảo stations luôn là array
  const stationsArray = Array.isArray(stations) ? stations : [];
  const totalPages = Math.ceil(stationsArray.length / perPage);
  const currentData = stationsArray.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <>
      <TopHeader />
      <NavigationBar />
      <div className="bus-stations-container">
        <h2 className="bus-stations-title">
          <span>bến xe</span>
        </h2>
        {loading ? (
          <div className="loading-container">
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <div className="bus-stations-grid">
              {currentData.map((station) => (
                <BusCard key={station.id} bus={station} />
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
