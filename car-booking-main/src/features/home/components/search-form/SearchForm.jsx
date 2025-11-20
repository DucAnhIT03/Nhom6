import "./SearchForm.css";
import { FaCalendarAlt } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";

const SearchForm = () => {
  return (
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
            <FaCalendarAlt style={{marginRight: '10px', color: "#000"}}/>
            Chọn ngày khởi hành
          </p>
        </div>
      </div>
      <button type="submit" className="search-button">
        <IoIosSearch size={24}/>
        <span>TÌM CHUYẾN XE</span>
      </button>
    </form>
  );
};

export default SearchForm;

