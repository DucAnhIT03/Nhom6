import "./TopHeader.css";
import { IoIosCall } from "react-icons/io";
import { TbMessageDots } from "react-icons/tb";

const TopHeader = () => {
  return (
    <div className="top-header">
      <div className="top-header-container">
        <div className="top-header-left">
          <span className="bus-icon">
            <img src="/bus.png" alt="" />
          </span>
          <span>Hệ thống đặt vé xe toàn quốc</span>
        </div>
        <div className="top-header-right">
          <div className="info">
            <TbMessageDots size={20}/>
            <a>info.vivutoday@gmail.com</a>
          </div>
          <span>|</span>
          <div className="info">
            <IoIosCall size={20}/>
            <a>1900 0152</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;

