import "./PopularBusStations.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useState, useEffect } from "react";
import { getStations } from "../../../../services/stationService";

const PopularBusStations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      try {
        const data = await getStations();
        // Đảm bảo data là array trước khi slice
        const stationsArray = Array.isArray(data) ? data : [];
        // Lấy 4 bến xe đầu tiên
        setStations(stationsArray.slice(0, 4));
      } catch (error) {
        console.error('Error loading stations:', error);
        setStations([]); // Set empty array nếu có lỗi
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  return (
    <section className="popular-bus-stations">
      <div className="section-container">
        <h2 className="section-title">Bến Xe Phổ Biến</h2>

        <button className="control-btn left">
          <FaChevronLeft size={18} />
        </button>
        <button className="control-btn right">
          <FaChevronRight size={18} />
        </button>

        {loading ? (
          <div className="loading-container">
            <p>Đang tải...</p>
          </div>
        ) : (
          <div className="stations-grid">
            {stations.map((station) => (
              <div key={station.id} className="station-card">
                <div className="station-image">
                  {station.image ? (
                    <img src={station.image} alt={station.name} />
                  ) : (
                    <div className="no-image">Không có ảnh</div>
                  )}
                </div>
                <h3 className="station-name">{station.name}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularBusStations;
