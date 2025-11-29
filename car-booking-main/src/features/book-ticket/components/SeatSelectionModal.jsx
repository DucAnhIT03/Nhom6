import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { getSeatsByBus } from "../../../services/seatService";
import { getSeatTypePrices } from "../../../services/seatTypePriceService";
import "./SeatSelectionModal.css";


const SeatSelectionModal = ({ isOpen, schedule, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [seatData, setSeatData] = useState({ seats: [], seatMap: {}, busName: "", busFloors: 1 });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatTypePriceMap, setSeatTypePriceMap] = useState({});

  useEffect(() => {
    if (!isOpen || !schedule?.busId) {
      setSeatData({ seats: [], seatMap: {}, busName: "", busFloors: 1 });
      setSelectedSeats([]);
      setError("");
      setSeatTypePriceMap({});
      return;
    }

    let isMounted = true;
    const fetchSeatsAndPrices = async () => {
      setLoading(true);
      setError("");
      try {
        // 1. Lấy danh sách giá vé theo loại cho tuyến / nhà xe hiện tại
        const routeId = schedule.routeId || schedule.route?.id;
        const companyId =
          schedule.route?.busCompanyId ||
          schedule.route?.busCompany?.id ||
          schedule.bus?.company?.id ||
          undefined;

        let seatPrices = [];
        if (routeId) {
          seatPrices = await getSeatTypePrices({
            routeId,
            companyId,
          });
        }
        if (isMounted) {
          const map = {};
          seatPrices.forEach((item) => {
            if (item?.seatType) {
              map[item.seatType] = Number(item.price) || 0;
            }
          });
          setSeatTypePriceMap(map);
        }

        // 2. Lấy sơ đồ ghế của xe (có scheduleId để check ghế đã đặt)
        const scheduleId = schedule.id || schedule.scheduleId;
        const data = await getSeatsByBus(schedule.busId, scheduleId);
        if (!isMounted) return;
        console.log('Seat data from API:', {
          busId: schedule.busId,
          seatsCount: data.seats?.length || 0,
          seatMapCount: Object.keys(data.seatMap || {}).length,
          busFloors: data.busFloors,
          busName: data.busName,
          layoutConfig: data.layoutConfig,
          allSeatNumbers: data.seats?.map(s => s.seatNumber || s.seat_number).slice(0, 10),
          lastSeatNumbers: data.seats?.map(s => s.seatNumber || s.seat_number).slice(-10),
        });
        setSeatData({
          ...data,
          layoutConfig: data.layoutConfig || null,
        });
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to load seat map:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Không thể tải sơ đồ ghế. Vui lòng thử lại."
        );
        setSeatData({ seats: [], seatMap: {}, busName: "", busFloors: 1 });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSeatsAndPrices();
    return () => {
      isMounted = false;
    };
  }, [isOpen, schedule?.busId]);

  // Màu sắc mặc định giống SeatMap
  const getSeatColor = (seatType, status, isHidden = false, isSelected = false) => {
    if (isHidden) {
      return '#e5e7eb'; // Màu xám nhạt cho ghế bị ẩn
    }

    if (status === 'BOOKED') {
      return '#9ca3af'; // Màu xám cho ghế đã bán
    }

    if (isSelected) {
      return '#a78bfa'; // Màu tím cho ghế đang chọn
    }

    // Màu sắc theo loại ghế
    switch (seatType) {
      case 'VIP':
        return '#fef08a'; // Màu vàng nhạt cho ghế VIP
      case 'DOUBLE':
      case 'LUXURY':
        return '#fbcfe8'; // Màu hồng cho ghế đôi
      case 'STANDARD':
      default:
        return '#bfdbfe'; // Màu xanh nhạt cho ghế thường
    }
  };

  const handleSeatToggle = (seat) => {
    if (seat.status === "BOOKED" || seat.isHidden || seat.is_hidden) return;

    const seatId = seat.id;
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleClose = () => {
    setSelectedSeats([]);
    onClose?.();
  };

  const defaultFloorNames = {
    'A': 'Tầng dưới',
    'B': 'Tầng trên',
    'C': 'Tầng 3',
  };

  const normalizedSeats = useMemo(() => {
    const seats = seatData.seats || [];
    const seatMap = seatData.seatMap || {};
    
    // Tạo map từ seatMap để tra cứu nhanh
    const seatMapByNumber = new Map();
    Object.entries(seatMap).forEach(([seatNumber, info]) => {
      seatMapByNumber.set(seatNumber.toUpperCase(), info);
    });

    // Ưu tiên sử dụng seats array (đầy đủ hơn), bổ sung thông tin từ seatMap nếu có
    const allSeats = seats.map(seat => {
      const seatNumber = (seat.seatNumber || seat.seat_number || '').toUpperCase();
      const mapInfo = seatMapByNumber.get(seatNumber);
      const rawSeatType =
        seat.seatType || seat.seat_type || mapInfo?.seat?.seatType || 'STANDARD';
      const configuredPrice =
        seatTypePriceMap[rawSeatType] ?? mapInfo?.seat?.priceForSeatType ?? 0;
      const finalPrice =
        Number(
          seat.priceForSeatType ||
            seat.price_for_seat_type ||
            configuredPrice,
        ) || 0;
      
      return {
        id: seat.id || seatNumber,
        seatNumber: seat.seatNumber || seat.seat_number || seatNumber,
        seat_number: seat.seatNumber || seat.seat_number || seatNumber,
        seatType: rawSeatType,
        seat_type: rawSeatType,
        status: seat.status || mapInfo?.seat?.status || 'AVAILABLE',
        isHidden:
          seat.isHidden ??
          seat.is_hidden ??
          mapInfo?.seat?.isHidden ??
          mapInfo?.seat?.is_hidden ??
          false,
        is_hidden:
          seat.isHidden ??
          seat.is_hidden ??
          mapInfo?.seat?.isHidden ??
          mapInfo?.seat?.is_hidden ??
          false,
        priceForSeatType: finalPrice,
        price_for_seat_type: finalPrice,
        ...seat,
      };
    });

    // Nếu seats array rỗng nhưng có seatMap, tạo từ seatMap
    if (allSeats.length === 0 && Object.keys(seatMap).length > 0) {
      return Object.entries(seatMap).map(([seatNumber, info]) => {
        const seat = info.seat || {};
        return {
          id: seat.id || seatNumber,
          seatNumber,
          seat_number: seatNumber,
          seatType: seat.seatType || seat.seat_type || 'STANDARD',
          seat_type: seat.seatType || seat.seat_type || 'STANDARD',
          status: seat.status || 'AVAILABLE',
          isHidden: seat.isHidden ?? seat.is_hidden ?? false,
          is_hidden: seat.isHidden ?? seat.is_hidden ?? false,
          priceForSeatType: seat.priceForSeatType || 0,
          ...seat,
        };
      });
    }

    console.log('Normalized seats:', {
      total: allSeats.length,
      sample: allSeats.slice(0, 5).map(s => s.seatNumber),
    });

    return allSeats;
  }, [seatData.seats, seatData.seatMap]);

  const seatsById = useMemo(() => {
    const map = new Map();
    normalizedSeats.forEach((seat) => {
      map.set(seat.id, seat);
    });
    return map;
  }, [normalizedSeats]);

  const selectedSeatDetails = useMemo(
    () =>
      selectedSeats
        .map((id) => seatsById.get(id))
        .filter(Boolean),
    [selectedSeats, seatsById],
  );

  const selectedTotalPrice = useMemo(
    () =>
      selectedSeatDetails.reduce(
        (sum, seat) => sum + (Number(seat.priceForSeatType || seat.price_for_seat_type) || 0),
        0,
      ),
    [selectedSeatDetails],
  );

  const formatCurrency = (value) => {
    if (!value || Number.isNaN(Number(value))) return '0₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Normalize layout config từ API
  const normalizedLayout = useMemo(() => {
    const layoutConfig = seatData.layoutConfig;
    if (!layoutConfig?.floorConfigs?.length) return null;
    const map = {};
    layoutConfig.floorConfigs.forEach((config) => {
      const prefix = (config.prefix || '').toUpperCase();
      if (!prefix) return;
      map[prefix] = {
        ...config,
        prefix,
        rows: Number(config.rows) || 1,
        columns: Number(config.columns) || 1,
        label: config.label || defaultFloorNames[prefix] || `Tầng ${prefix}`,
      };
    });
    return map;
  }, [seatData.layoutConfig]);

  // Nhóm ghế theo tầng và sắp xếp theo hàng, cột (giống SeatMap)
  const groupSeatsByFloor = useMemo(() => {
    const floors = {};

    // Bước 1: Nhóm ghế theo prefix (A, B, C...)
    normalizedSeats.forEach((seat) => {
      const seatNumber = (seat.seatNumber || seat.seat_number || '').toUpperCase();
      const floorMatch = seatNumber.match(/^([A-Z]+)/);
      const floor = floorMatch ? floorMatch[1] : 'A';
      
      if (!floors[floor]) {
        floors[floor] = {
          seats: [],
          seatNumbers: [],
        };
      }
      floors[floor].seats.push(seat);
      floors[floor].seatNumbers.push(seatNumber);
    });

    // Bước 2: Sử dụng layout config từ API nếu có, nếu không thì tự tính
    Object.keys(floors).forEach(floor => {
      const floorSeats = floors[floor].seats;
      const seatNumbers = floors[floor].seatNumbers.sort();
      const layoutForFloor = normalizedLayout?.[floor];
      
      // Ưu tiên dùng layout config từ API
      let detectedColumns = layoutForFloor?.columns || 5;
      let detectedRows = layoutForFloor?.rows;
      
      // Nếu không có layout config, tự tính
      if (!layoutForFloor) {
        const numbers = seatNumbers.map(sn => {
          const numStr = sn.replace(/^[A-Z]+/, '');
          return parseInt(numStr, 10) || 0;
        }).filter(n => n > 0).sort((a, b) => a - b);
        
        if (numbers.length > 0) {
          const maxNum = Math.max(...numbers);
          const minNum = Math.min(...numbers);
          
          // Thử các giá trị columns phổ biến
          let bestColumns = 5;
          let bestScore = Infinity;
          
          for (const cols of [3, 4, 5, 6, 7, 8]) {
            const estimatedRows = Math.ceil(maxNum / cols);
            const totalSeats = estimatedRows * cols;
            const seatDiff = Math.abs(numbers.length - totalSeats);
            const isContinuous = numbers.length === (maxNum - minNum + 1);
            const patternMatch = isContinuous && (maxNum <= totalSeats);
            const score = patternMatch ? seatDiff : seatDiff + 10;
            
            if (score < bestScore) {
              bestScore = score;
              bestColumns = cols;
            }
          }
          
          detectedColumns = bestColumns;
        }
      }
      
      // Sắp xếp ghế theo số thứ tự
      floorSeats.sort((a, b) => {
        const numA = parseInt((a.seatNumber || a.seat_number || '').replace(/^[A-Z]+/, ''), 10) || 0;
        const numB = parseInt((b.seatNumber || b.seat_number || '').replace(/^[A-Z]+/, ''), 10) || 0;
        return numA - numB;
      });
      
      // Tính row và col cho mỗi ghế
      floorSeats.forEach((seat, idx) => {
        const seatNumber = (seat.seatNumber || seat.seat_number || '').toUpperCase();
        const numStr = seatNumber.replace(/^[A-Z]+/, '');
        const num = parseInt(numStr, 10) || (idx + 1);
        const row = Math.floor((num - 1) / detectedColumns) + 1;
        const col = ((num - 1) % detectedColumns) + 1;
        
        seat.position = {
          floor,
          row,
          col,
          display: numStr || num.toString().padStart(2, '0'),
          columns: detectedColumns,
        };
      });
      
      floors[floor].columns = detectedColumns;
      floors[floor].label = layoutForFloor?.label || defaultFloorNames[floor] || (floor === 'A' ? 'Tầng dưới' : floor === 'B' ? 'Tầng trên' : `Tầng ${floor}`);
    });

    return floors;
  }, [normalizedSeats, normalizedLayout]);

  const floorOrder = useMemo(() => {
    // Sắp xếp theo thứ tự A, B, C...
    return Object.keys(groupSeatsByFloor).sort((a, b) => {
      return a.localeCompare(b);
    });
  }, [groupSeatsByFloor]);

  const legend = [
    { label: "Đã bán", color: "#9ca3af" },
    { label: "Ghế thường", color: "#bfdbfe" },
    { label: "Ghế VIP", color: "#fef08a" },
    { label: "Ghế đôi", color: "#fbcfe8" },
    { label: "Đã ẩn", color: "#e5e7eb", isHidden: true },
  ];

  if (!isOpen) return null;

  return (
    <div className="seat-modal-overlay">
      <div className="seat-modal">
        <div className="seat-modal-header">
          <div>
            <h3>Chọn ghế - {seatData.busName || schedule?.bus?.name || "Xe khách"}</h3>
            <p>
              {schedule?.route?.departureStation?.name || "Điểm đi"} →{" "}
              {schedule?.route?.arrivalStation?.name || "Điểm đến"} ·{" "}
              {schedule?.departureTime
                ? new Date(schedule.departureTime).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : ""}
            </p>
          </div>
          <button className="seat-modal-close" onClick={handleClose} type="button">
            <IoClose size={22} />
          </button>
        </div>

        <div className="seat-legend">
          {legend.map((item) => (
            <div key={item.label} className="seat-legend-item">
              <div 
                className="seat-legend-color" 
                style={{ backgroundColor: item.color }}
              >
                {item.isHidden && <span className="legend-hidden-x">✕</span>}
              </div>
              <p>{item.label}</p>
            </div>
          ))}
          <div className="seat-legend-hint">
            💡 Click vào ghế để chọn
          </div>
        </div>

        <div className="seat-area">
          {loading && <p>Đang tải sơ đồ ghế...</p>}
          {!loading && error && <p className="seat-error">{error}</p>}
          {!loading && !error && Object.keys(groupSeatsByFloor).length === 0 && (
            <p>Xe chưa có cấu hình sơ đồ ghế.</p>
          )}
          {!loading && !error && Object.keys(groupSeatsByFloor).length > 0 && (
            <div className="seat-layout">
              {floorOrder.map(floorKey => {
                const floorData = groupSeatsByFloor[floorKey];
                if (!floorData) return null;
                const { seats: floorSeats, columns } = floorData;
                
                // Nhóm ghế theo hàng (ngang)
                const seatsByRow = {};
                floorSeats.forEach(seat => {
                  const row = seat.position.row;
                  if (!seatsByRow[row]) {
                    seatsByRow[row] = [];
                  }
                  seatsByRow[row].push(seat);
                });

                // Sắp xếp ghế trong mỗi hàng theo cột
                Object.keys(seatsByRow).forEach(row => {
                  seatsByRow[row].sort((a, b) => a.position.col - b.position.col);
                });

                // Lấy danh sách hàng đã sắp xếp
                const sortedRows = Object.keys(seatsByRow)
                  .map(Number)
                  .sort((a, b) => a - b);

                // Debug log cho tầng này
                if (floorKey === 'A' && sortedRows.length > 0) {
                  console.log(`Debug tầng ${floorKey}:`, {
                    columns,
                    totalSeats: floorSeats.length,
                    rows: sortedRows.length,
                    seatsPerRow: sortedRows.map(r => ({
                      row: r,
                      count: seatsByRow[r].length,
                      seats: seatsByRow[r].map(s => ({
                        seatNumber: s.seatNumber || s.seat_number,
                        row: s.position.row,
                        col: s.position.col,
                      })),
                    })),
                    sampleParsed: floorSeats.slice(0, 10).map(s => ({
                      seatNumber: s.seatNumber || s.seat_number,
                      row: s.position.row,
                      col: s.position.col,
                    })),
                  });
                }

                return (
                  <div key={floorKey} className="seat-floor">
                    <h4 className="seat-floor-title">
                      {floorData.label || defaultFloorNames[floorKey] || `Tầng ${floorKey}`}
                    </h4>
                    <div className="seat-floor-rows">
                      {sortedRows.map(row => {
                        const rowSeats = seatsByRow[row] || [];
                        // Tạo mảng đầy đủ với số cột từ layout config
                        const seatsArray = Array.from({ length: columns }, (_, colIndex) => {
                          const col = colIndex + 1;
                          return rowSeats.find(seat => seat.position.col === col) || null;
                        });

                        return (
                          <div key={`${floorKey}-row-${row}`} className="seat-row">
                            {seatsArray.map((seat, colIndex) => {
                              if (!seat) {
                                // Placeholder cho cột trống (nếu cần)
                                return (
                                  <div
                                    key={`${floorKey}-row-${row}-col-${colIndex + 1}-empty`}
                                    className="seat-empty"
                                    style={{ width: '48px', height: '48px' }}
                                  />
                                );
                              }

                              const isHidden = seat.isHidden || seat.is_hidden || false;
                              const isSelected = selectedSeats.includes(seat.id);
                              const seatType = seat.seatType || seat.seat_type || 'STANDARD';
                              const status = seat.status || 'AVAILABLE';
                              const seatNumber = seat.seatNumber || seat.seat_number || '';
                              const backendColor = seatData.seatMap?.[seatNumber]?.color;
                              const baseColor = backendColor || getSeatColor(seatType, status, isHidden, false);
                              const seatColor = isSelected ? '#c4b5fd' : baseColor;
                              const isBooked = status === 'BOOKED';

                              return (
                                <button
                                  key={seat.id}
                                  type="button"
                                  onClick={() => handleSeatToggle(seat)}
                                  disabled={isBooked || isHidden}
                                  className={`seat ${isBooked ? 'booked' : isHidden ? 'hidden' : isSelected ? 'selected' : 'available'}`}
                                  style={{
                                    backgroundColor: seatColor,
                                    borderColor: isSelected ? '#a78bfa' : isBooked ? '#6b7280' : isHidden ? '#d1d5db' : '#e5e7eb',
                                    color: isBooked ? '#ffffff' : isHidden ? '#9ca3af' : '#1f2937',
                                  }}
                                  title={`${seatNumber} - ${seatType || 'Thường'} - ${isHidden ? 'Đã ẩn' : status === 'BOOKED' ? 'Đã bán' : 'Còn trống'}`}
                                >
                                  {isHidden ? (
                                    <span className="hidden-x">✕</span>
                                  ) : (
                                    seat.position.display || seatNumber
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="seat-modal-footer">
          <div>
            <p>
              Đã chọn:{" "}
              {selectedSeatDetails.length > 0
                ? selectedSeatDetails
                    .map((seat) => seat.seatNumber || seat.seat_number || seat.id)
                    .join(", ")
                : "Chưa chọn ghế nào"}
            </p>
            {selectedSeatDetails.length > 0 && (
              <p style={{ marginTop: 4, fontSize: 14 }}>
                Tạm tính: <strong>{formatCurrency(selectedTotalPrice)}</strong>
              </p>
            )}
          </div>
          <div className="seat-modal-actions">
            <button className="seat-cancel-btn" onClick={handleClose} type="button">
              Đóng
            </button>
            <button
              className="seat-confirm-btn"
              type="button"
              disabled={selectedSeats.length === 0}
              onClick={() => {
                const seatDetails = selectedSeatDetails.map((seat) => ({
                  id: seat.id,
                  seatNumber: seat.seatNumber || seat.seat_number,
                  label: seat.seatNumber || seat.seat_number,
                  priceForSeatType: seat.priceForSeatType || seat.price_for_seat_type || 0,
                }));

                navigate("/checkout", {
                  state: {
                    schedule,
                    seats: selectedSeats,
                    seatDetails,
                  },
                });
                onClose?.();
              }}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionModal;


