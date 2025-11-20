import TopHeader from "../../../shared/components/header/TopHeader";
import NavigationBar from "../../../shared/components/header/NavigationBar";
import Footer from "../../../shared/components/footer/Footer";
import "./BookTicket.css";
import { FaCalendarAlt } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import FilterSidebar from "../components/FilterSidebar";
import BusCard from "../components/BusCard";
import { RiArrowDropDownLine } from "react-icons/ri";

const BookTicket = () => {
  const busList = [
    {
      name: "Vip Phương Huy Luxury",
      type: "Limousine 9 chỗ",
      rating: 4.5,
      reviews: 21,
      start: "21:00",
      end: "22:30",
      price: "220.000",
      empty: 10,
      from: "Ha Noi Office - Co Linh",
      to: "Hai Phong",
      image: "/bus-demo.jpg",
    },
    {
      name: "Vip Phương Huy Luxury",
      type: "Limousine 9 chỗ",
      rating: 4.5,
      reviews: 21,
      start: "21:01",
      end: "22:30",
      price: "220.000",
      empty: 10,
      from: "Ha Noi Office - Co Linh",
      to: "Hai Phong",
      image: "/bus-demo.jpg",
    },
    {
      name: "Vip Phương Huy Luxury",
      type: "Limousine 9 chỗ",
      rating: 4.5,
      reviews: 21,
      start: "21:00",
      end: "22:31",
      price: "220.000",
      empty: 10,
      from: "Ha Noi Office - Co Linh",
      to: "Hai Phong",
      image: "/bus-demo.jpg",
    },
    {
      name: "Vip Phương Huy Luxury",
      type: "Limousine 9 chỗ",
      rating: 4.5,
      reviews: 21,
      start: "21:00",
      end: "22:31",
      price: "220.000",
      empty: 10,
      from: "Ha Noi Office - Co Linh",
      to: "Hai Phong",
      image: "/bus-demo.jpg",
    },
    {
      name: "Vip Phương Huy Luxury",
      type: "Limousine 9 chỗ",
      rating: 4.5,
      reviews: 21,
      start: "21:00",
      end: "22:31",
      price: "220.000",
      empty: 10,
      from: "Ha Noi Office - Co Linh",
      to: "Hai Phong",
      image: "/bus-demo.jpg",
    },
  ];

  return (
    <div>
      <TopHeader />
      <NavigationBar />
      <p class="header-title">
        <span>Hà Nội</span> đến <span>Hải Phòng</span>
      </p>
      <form className="search-form">
        <div className="search-fields">
          <div className="search-field">
            <h3>Điểm Khởi Hành</h3>
            <p>Chọn điểm khởi hành</p>
          </div>
          <div className="search-field">
            <h3>Điểm Đến</h3>
            <p>Chọn điểm đến</p>
          </div>
          <div className="search-field">
            <h3>Ngày Khởi Hành</h3>
            <p>
              <FaCalendarAlt style={{ marginRight: "10px", color: "#000" }} />
              Chọn ngày khởi hành
            </p>
          </div>
        </div>
        <button type="submit" className="search-button">
          <IoIosSearch size={24} />
          <span>TÌM CHUYẾN XE</span>
        </button>
      </form>
      <div className="filer-box">
        <div className="sort-bar">
          <span>Sắp xếp theo tuyến đường</span>
          <button className="sort-btn">
            Giờ đi <RiArrowDropDownLine size={16} />
          </button>
          <button className="sort-btn">
            Mức giá <RiArrowDropDownLine size={16} />
          </button>
        </div>
      </div>
      <div className="searchbus-container">
        <FilterSidebar />
        <div className="bus-list">
          {busList.map((b, i) => (
            <BusCard key={i} bus={b} />
          ))}
        </div>
      </div>
      <div className="img-footer">
        <img src="/booked-ticket.png" alt="" />
      </div>
      <Footer />
    </div>
  );
};

export default BookTicket;
