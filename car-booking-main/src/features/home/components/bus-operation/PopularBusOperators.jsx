import { useState, useEffect } from "react";
import "./PopularBusOperators.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getBusCompanies } from "../../../../services/busCompanyService";

const PopularBusOperators = () => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchOperators = async () => {
      setLoading(true);
      try {
        const data = await getBusCompanies({ limit: 4 });
        // Chỉ update state nếu component vẫn còn mounted
        if (isMounted) {
          // Đảm bảo data là array và lấy 4 nhà xe đầu tiên
          const operatorsArray = Array.isArray(data) ? data : [];
          setOperators(operatorsArray.slice(0, 4).map(company => ({
            name: company.name || company.company_name,
            image: company.image || '/bus.jpg',
          })));
        }
      } catch (error) {
        console.error('Error loading operators:', error);
        if (isMounted) {
          setOperators([]); // Set empty array nếu có lỗi
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchOperators();
    
    // Cleanup function để tránh update state sau khi component unmount
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="popular-bus-operators">
        <div className="section-container">
          <h2 className="section-title">Nhà Xe Phổ Biến</h2>
          <div className="loading-container">
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="popular-bus-operators">
      <div className="section-container">
        <h2 className="section-title">Nhà Xe Phổ Biến</h2>
        <button className="control-btn left">
          <FaChevronLeft size={18} />
        </button>
        <button className="control-btn right">
          <FaChevronRight size={18} />
        </button>
        <div className="operators-grid">
          {operators.length > 0 ? (
            operators.map((operator, index) => (
              <div key={index} className="operator-card">
                <div className="operator-image">
                  <img src={operator.image} alt={operator.name} />
                </div>
                <h3 className="operator-name">{operator.name}</h3>
              </div>
            ))
          ) : (
            <p>Không có dữ liệu nhà xe</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default PopularBusOperators;
