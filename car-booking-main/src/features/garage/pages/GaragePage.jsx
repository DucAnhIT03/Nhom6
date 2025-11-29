import React, { useState, useEffect } from "react";
import BusCard from "../components/BusCard";
import Pagination from "../../../shared/components/pagination/Pagination";
import TopHeader from "../../../shared/components/header/TopHeader";
import NavigationBar from "../../../shared/components/header/NavigationBar";
import Footer from "../../../shared/components/footer/Footer";
import { getBusCompanies } from "../../../services/busCompanyService";
import "./GaragePage.css";

export default function GaragePage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    let isMounted = true;
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const data = await getBusCompanies({ page: currentPage, limit: perPage });
        // Chỉ update state nếu component vẫn còn mounted
        if (isMounted) {
          // Đảm bảo data là array
          setCompanies(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error loading companies:', error);
        if (isMounted) {
          setCompanies([]); // Set empty array nếu có lỗi
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchCompanies();
    
    // Cleanup function để tránh update state sau khi component unmount
    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  // Đảm bảo companies luôn là array
  const companiesArray = Array.isArray(companies) ? companies : [];
  const totalPages = Math.ceil(companiesArray.length / perPage);
  const currentData = companiesArray.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <>
      <TopHeader />
      <NavigationBar />
      <div className="bus-stations-container">
        <h2 className="bus-stations-title">
          <span>nhà xe</span>
        </h2>
        {loading ? (
          <div className="loading-container">
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <div className="bus-stations-grid">
              {currentData.map((company) => (
                <BusCard 
                  key={company.id} 
                  companyId={company.id}
                  bus={{
                    name: company.name || company.company_name,
                    description: company.address || company.descriptions || '',
                    image: company.image || '/bus-garage.png',
                  }} 
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
