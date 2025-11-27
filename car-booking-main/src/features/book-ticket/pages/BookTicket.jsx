import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import TopHeader from "../../../shared/components/header/TopHeader";
import NavigationBar from "../../../shared/components/header/NavigationBar";
import Footer from "../../../shared/components/footer/Footer";
import Pagination from "../../../shared/components/pagination/Pagination";
import "./BookTicket.css";
import FilterSidebar from "../components/FilterSidebar";
import BusCard from "../components/BusCard";
import SeatSelectionModal from "../components/SeatSelectionModal";
import { RiArrowDropDownLine } from "react-icons/ri";
import SearchForm from "../../home/components/search-form/SearchForm";
import { getSchedules } from "../../../services/scheduleService";

const LIMIT = 6;

const BookTicket = () => {
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const filters = useMemo(
    () => ({
      departureId: searchParams.get("departureId") || "",
      arrivalId: searchParams.get("arrivalId") || "",
      date: searchParams.get("date") || "",
      departureName: searchParams.get("departureName") || "",
      arrivalName: searchParams.get("arrivalName") || "",
    }),
    [searchParams]
  );

  const initialSearchValues = useMemo(
    () => ({
      departureId: filters.departureId,
      arrivalId: filters.arrivalId,
      date: filters.date,
    }),
    [filters]
  );

  const readableDate = filters.date
    ? new Date(filters.date).toLocaleDateString("vi-VN")
    : "";

  const hasSelection = Boolean(filters.departureName && filters.arrivalName);

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [sortByTime, setSortByTime] = useState(null); // null, 'asc', 'desc'
  const [sortByPrice, setSortByPrice] = useState(null); // null, 'asc', 'desc'
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.departureId, filters.arrivalId, filters.date]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.sort-dropdown-wrapper')) {
        setTimeDropdownOpen(false);
        setPriceDropdownOpen(false);
      }
    };

    if (timeDropdownOpen || priceDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [timeDropdownOpen, priceDropdownOpen]);

  useEffect(() => {
    let isMounted = true;
    const fetchSchedulesData = async () => {
      setLoading(true);
      setError("");
      try {
        const queryParams = {
          page: currentPage,
          limit: LIMIT,
          status: "AVAILABLE",
        };

        if (filters.departureId) {
          queryParams.departureStationId = Number(filters.departureId);
        }
        if (filters.arrivalId) {
          queryParams.arrivalStationId = Number(filters.arrivalId);
        }
        if (filters.date) {
          queryParams.departureDate = filters.date;
        }

        const response = await getSchedules(queryParams);
        if (!isMounted) return;
        setSchedules(response.items || []);
        setTotalPages(response.totalPages || 1);
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to fetch schedules:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Không thể tải lịch trình. Vui lòng thử lại sau."
        );
        setSchedules([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSchedulesData();

    return () => {
      isMounted = false;
    };
  }, [filters.departureId, filters.arrivalId, filters.date, currentPage]);

  const handleOpenSeatModal = (schedule) => {
    setActiveSchedule(schedule);
    setSeatModalOpen(true);
  };

  const handleCloseSeatModal = () => {
    setSeatModalOpen(false);
    setActiveSchedule(null);
  };

  // Sắp xếp schedules
  const sortedSchedules = useMemo(() => {
    if (!schedules.length) return [];

    let sorted = [...schedules];

    // Sắp xếp theo giờ đi
    if (sortByTime === 'asc') {
      sorted.sort((a, b) => {
        const timeA = new Date(a.departureTime || 0).getTime();
        const timeB = new Date(b.departureTime || 0).getTime();
        return timeA - timeB;
      });
    } else if (sortByTime === 'desc') {
      sorted.sort((a, b) => {
        const timeA = new Date(a.departureTime || 0).getTime();
        const timeB = new Date(b.departureTime || 0).getTime();
        return timeB - timeA;
      });
    }

    // Sắp xếp theo giá (nếu có)
    if (sortByPrice === 'asc') {
      sorted.sort((a, b) => {
        const priceA = a.route?.price || 0;
        const priceB = b.route?.price || 0;
        return priceA - priceB;
      });
    } else if (sortByPrice === 'desc') {
      sorted.sort((a, b) => {
        const priceA = a.route?.price || 0;
        const priceB = b.route?.price || 0;
        return priceB - priceA;
      });
    }

    return sorted;
  }, [schedules, sortByTime, sortByPrice]);

  const handleSortByTime = (option) => {
    if (option === 'none') {
      setSortByTime(null);
    } else {
      setSortByTime(option);
      setSortByPrice(null); // Reset price sort when time sort is selected
    }
    setTimeDropdownOpen(false);
  };

  const handleSortByPrice = (option) => {
    if (option === 'none') {
      setSortByPrice(null);
    } else {
      setSortByPrice(option);
      setSortByTime(null); // Reset time sort when price sort is selected
    }
    setPriceDropdownOpen(false);
  };

  return (
    <div>
      <TopHeader />
      <NavigationBar />
      <p className="header-title">
        {hasSelection ? (
          <>
            <span>{filters.departureName}</span> đến{" "}
            <span>{filters.arrivalName}</span>
            {readableDate && (
              <span className="header-date"> · {readableDate}</span>
            )}
          </>
        ) : (
          <>Tìm chuyến xe phù hợp cho bạn</>
        )}
      </p>
      <SearchForm initialValues={initialSearchValues} />
      <div className="filer-box">
        <div className="sort-bar">
          <span>Sắp xếp theo tuyến đường</span>
          <div className="sort-dropdown-wrapper">
            <button 
              className="sort-btn" 
              type="button"
              onClick={() => {
                setTimeDropdownOpen(!timeDropdownOpen);
                setPriceDropdownOpen(false);
              }}
            >
              Giờ đi <RiArrowDropDownLine size={16} />
            </button>
            {timeDropdownOpen && (
              <div className="sort-dropdown">
                <button
                  type="button"
                  className={`sort-dropdown-item ${sortByTime === null ? 'active' : ''}`}
                  onClick={() => handleSortByTime('none')}
                >
                  Mặc định
                </button>
                <button
                  type="button"
                  className={`sort-dropdown-item ${sortByTime === 'asc' ? 'active' : ''}`}
                  onClick={() => handleSortByTime('asc')}
                >
                  Sớm nhất
                </button>
                <button
                  type="button"
                  className={`sort-dropdown-item ${sortByTime === 'desc' ? 'active' : ''}`}
                  onClick={() => handleSortByTime('desc')}
                >
                  Muộn nhất
                </button>
              </div>
            )}
          </div>
          <div className="sort-dropdown-wrapper">
            <button 
              className="sort-btn" 
              type="button"
              onClick={() => {
                setPriceDropdownOpen(!priceDropdownOpen);
                setTimeDropdownOpen(false);
              }}
            >
              Mức giá <RiArrowDropDownLine size={16} />
            </button>
            {priceDropdownOpen && (
              <div className="sort-dropdown">
                <button
                  type="button"
                  className={`sort-dropdown-item ${sortByPrice === null ? 'active' : ''}`}
                  onClick={() => handleSortByPrice('none')}
                >
                  Mặc định
                </button>
                <button
                  type="button"
                  className={`sort-dropdown-item ${sortByPrice === 'asc' ? 'active' : ''}`}
                  onClick={() => handleSortByPrice('asc')}
                >
                  Giá thấp đến cao
                </button>
                <button
                  type="button"
                  className={`sort-dropdown-item ${sortByPrice === 'desc' ? 'active' : ''}`}
                  onClick={() => handleSortByPrice('desc')}
                >
                  Giá cao đến thấp
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="searchbus-container">
        <FilterSidebar />
        <div className="bus-list">
          {loading && (
            <div className="state-message">
              <p>Đang tải danh sách chuyến xe...</p>
            </div>
          )}
          {!loading && error && (
            <div className="state-message error">
              <p>{error}</p>
            </div>
          )}
          {!loading && !error && schedules.length === 0 && (
            <div className="state-message">
              <p>
                Không tìm thấy lịch trình phù hợp. Hãy điều chỉnh điểm đi, điểm
                đến hoặc ngày khởi hành.
              </p>
            </div>
          )}
          {!loading &&
            !error &&
            sortedSchedules.map((schedule) => (
              <BusCard
                key={schedule.id}
                schedule={schedule}
                onBookClick={handleOpenSeatModal}
              />
            ))}
          {!loading && !error && totalPages > 1 && (
            <Pagination
              current={currentPage}
              total={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
      <div className="img-footer">
        <img src="/booked-ticket.png" alt="" />
      </div>
      <Footer />
      <SeatSelectionModal
        isOpen={seatModalOpen}
        schedule={activeSchedule}
        onClose={handleCloseSeatModal}
      />
    </div>
  );
};

export default BookTicket;
