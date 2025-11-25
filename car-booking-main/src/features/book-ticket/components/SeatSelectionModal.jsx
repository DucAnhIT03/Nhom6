import { useEffect, useMemo, useState } from "react";
import { IoClose } from "react-icons/io5";
import { getSeatsByBus } from "../../../services/seatService";
import "./SeatSelectionModal.css";

const LAYOUT_STORAGE_KEY = 'seat_layout_configs';

const loadSeatLayoutConfig = (busId) => {
  if (typeof window === 'undefined') return null;
  try {
    const data = JSON.parse(localStorage.getItem(LAYOUT_STORAGE_KEY) || '{}');
    return data?.[busId] || null;
  } catch (error) {
    console.warn('Cannot load seat layout configs', error);
    return null;
  }
};

const SeatSelectionModal = ({ isOpen, schedule, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [seatData, setSeatData] = useState({ seats: [], seatMap: {}, busName: "", busFloors: 1 });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [layoutConfig, setLayoutConfig] = useState(null);

  useEffect(() => {
    if (!isOpen || !schedule?.busId) {
      setSeatData({ seats: [], seatMap: {}, busName: "", busFloors: 1 });
      setSelectedSeats([]);
      setError("");
      setLayoutConfig(null);
      return;
    }

    // Load layout config từ localStorage
    const layout = loadSeatLayoutConfig(Number(schedule.busId));
    console.log('Layout config loaded:', {
      busId: schedule.busId,
      layout,
      hasConfig: !!layout,
      floorConfigs: layout?.floorConfigs,
      floors: layout?.floors,
      allConfigs: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(LAYOUT_STORAGE_KEY) || '{}') : {},
    });
    
    if (!layout) {
      console.warn(`⚠️ Không tìm thấy layout config cho busId ${schedule.busId}. Vui lòng setup layout trong admin trước.`);
    }
    
    setLayoutConfig(layout);

    let isMounted = true;
    const fetchSeats = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getSeatsByBus(schedule.busId);
        if (!isMounted) return;
        console.log('Seat data from API:', {
          busId: schedule.busId,
          seatsCount: data.seats?.length || 0,
          seatMapCount: Object.keys(data.seatMap || {}).length,
          busFloors: data.busFloors,
          busName: data.busName,
          allSeatNumbers: data.seats?.map(s => s.seatNumber || s.seat_number).slice(0, 10),
          lastSeatNumbers: data.seats?.map(s => s.seatNumber || s.seat_number).slice(-10),
        });
        setSeatData(data);
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

    fetchSeats();
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

  // Normalize layout config giống như SeatMap
  const normalizedLayout = useMemo(() => {
    if (!layoutConfig?.floorConfigs?.length) return null;
    const map = {};
    layoutConfig.floorConfigs.forEach((config, index) => {
      const prefix = (config.prefix || '').toUpperCase();
      if (!prefix) return;
      map[prefix] = {
        ...config,
        prefix,
        rows: Number(config.rows) || 1,
        columns: Number(config.columns) || 1,
        label:
          config.label ||
          (config.floor === 1
            ? 'Tầng dưới'
            : config.floor === 2
              ? 'Tầng trên'
              : `Tầng ${config.floor || index + 1}`),
      };
    });
    return map;
  }, [layoutConfig]);

  const defaultFloorNames = {
    'A': 'Tầng dưới',
    'B': 'Tầng trên',
    'C': 'Tầng 3',
  };

  // Tìm layout cho một ghế dựa vào prefix
  const findLayoutForSeat = (seatNumber) => {
    if (!normalizedLayout || !seatNumber) return null;
    const upperSeat = seatNumber.toUpperCase();
    const prefixes = Object.keys(normalizedLayout).sort((a, b) => b.length - a.length);
    for (const prefix of prefixes) {
      if (upperSeat.startsWith(prefix)) {
        return normalizedLayout[prefix];
      }
    }
    return null;
  };

  // Parse vị trí ghế giống như SeatMap
  const parseSeatPosition = (seatNumber, fallbackIndex = 0) => {
    const layout = findLayoutForSeat(seatNumber);
    if (layout) {
      const numericPart = seatNumber.substring(layout.prefix.length);
      const order = parseInt(numericPart, 10);
      // Sử dụng columns từ layout config (bắt buộc)
      const columns = Math.max(1, Number(layout.columns) || 1);
      if (order && order > 0) {
        // Tính row và col dựa vào order và columns
        // Ví dụ: order=1, columns=5 => row=1, col=1
        //        order=5, columns=5 => row=1, col=5
        //        order=6, columns=5 => row=2, col=1
        const row = Math.floor((order - 1) / columns) + 1;
        const col = ((order - 1) % columns) + 1;
        return {
          floor: layout.prefix,
          row,
          col,
          display: numericPart || order.toString().padStart(2, '0'),
          columns, // Luôn dùng columns từ layout config
        };
      }
    }

    // Fallback parsing - nhận diện prefix A, B, C...
    const floorMatch = seatNumber.match(/^([A-Z]+)/i);
    const floor = floorMatch ? floorMatch[1].toUpperCase() : (seatNumber.charAt(0).toUpperCase() || `F${fallbackIndex}`);
    const numStr = seatNumber.substring(floor.length);
    const num = parseInt(numStr, 10) || fallbackIndex + 1;
    
    // Ưu tiên dùng columns từ layout config
    let colsPerRow = 5; // Mặc định 5 cột
    if (normalizedLayout && normalizedLayout[floor]) {
      colsPerRow = Math.max(1, Number(normalizedLayout[floor].columns) || 5);
    } else {
      // Nếu không có layout config, ước tính dựa vào prefix
      // A thường là tầng dưới (4-5 cột), B là tầng trên (3-5 cột)
      if (floor === 'A') colsPerRow = 5;
      else if (floor === 'B') colsPerRow = 5;
      else colsPerRow = 5;
    }
    
    // Sử dụng cùng logic như khi có layout config
    const row = Math.floor((num - 1) / colsPerRow) + 1;
    const col = ((num - 1) % colsPerRow) + 1;

    return {
      floor,
      row,
      col,
      display: numStr || num.toString().padStart(2, '0'),
      columns: colsPerRow,
    };
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
      
      return {
        id: seat.id || seatNumber,
        seatNumber: seat.seatNumber || seat.seat_number || seatNumber,
        seat_number: seat.seatNumber || seat.seat_number || seatNumber,
        seatType: seat.seatType || seat.seat_type || mapInfo?.seat?.seatType || 'STANDARD',
        seat_type: seat.seatType || seat.seat_type || mapInfo?.seat?.seatType || 'STANDARD',
        status: seat.status || mapInfo?.seat?.status || 'AVAILABLE',
        isHidden: seat.isHidden ?? seat.is_hidden ?? mapInfo?.seat?.isHidden ?? mapInfo?.seat?.is_hidden ?? false,
        is_hidden: seat.isHidden ?? seat.is_hidden ?? mapInfo?.seat?.isHidden ?? mapInfo?.seat?.is_hidden ?? false,
        priceForSeatType: seat.priceForSeatType || seat.price_for_seat_type || mapInfo?.seat?.priceForSeatType || 0,
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

  // Nhóm ghế theo tầng và sắp xếp theo hàng, cột (giống SeatMap)
  const groupSeatsByFloor = useMemo(() => {
    const floors = {};

    normalizedSeats.forEach((seat, index) => {
      const seatNumber = seat.seatNumber || seat.seat_number || '';
      const pos = parseSeatPosition(seatNumber, index);
      const floor = pos.floor;
      if (!floors[floor]) {
        // Ưu tiên dùng columns từ layout config
        const layoutColumns = normalizedLayout?.[floor]?.columns;
        const defaultColumns = layoutColumns || pos.columns || 5;
        
        floors[floor] = {
          seats: [],
          columns: defaultColumns,
          label: normalizedLayout?.[floor]?.label || defaultFloorNames[floor] || `Tầng ${floor}`,
        };
      }
      const seatWithPos = {
        ...seat,
        position: pos,
      };
      
      // Đảm bảo columns luôn lấy từ layout config nếu có
      if (normalizedLayout?.[floor]?.columns) {
        floors[floor].columns = normalizedLayout[floor].columns;
      } else if (pos.columns) {
        floors[floor].columns = pos.columns;
      }
      
      floors[floor].seats.push(seatWithPos);
    });

    // Sắp xếp ghế trong mỗi tầng: theo hàng trước, sau đó theo cột
    Object.keys(floors).forEach(floor => {
      floors[floor].seats.sort((a, b) => {
        if (a.position.row !== b.position.row) {
          return a.position.row - b.position.row;
        }
        return a.position.col - b.position.col;
      });
    });

    const busCapacity = schedule?.bus?.capacity || seatData.busFloors || 0;
    const totalSeats = normalizedSeats.length;
    
    // Chỉ cảnh báo khi số ghế vượt quá capacity hoặc thiếu quá nhiều
    if (busCapacity > 0) {
      if (totalSeats > busCapacity) {
        console.warn(`⚠️ Số ghế vượt quá capacity: API trả về ${totalSeats} ghế nhưng capacity chỉ ${busCapacity} cho busId ${schedule?.busId}`);
      } else if (totalSeats < busCapacity && (busCapacity - totalSeats) > 5) {
        // Chỉ cảnh báo nếu thiếu hơn 5 ghế
        console.info(`ℹ️ Số ghế: ${totalSeats}/${busCapacity} (capacity: ${busCapacity}) cho busId ${schedule?.busId}`);
      } else if (totalSeats !== busCapacity) {
        // Chênh lệch nhỏ, chỉ log info
        console.info(`ℹ️ Số ghế: ${totalSeats}/${busCapacity} cho busId ${schedule?.busId}`);
      }
    }
    
    console.log('Grouped seats by floor:', {
      totalSeats: normalizedSeats.length,
      busCapacity,
      busId: schedule?.busId,
      hasLayoutConfig: !!normalizedLayout,
      layoutConfig: normalizedLayout,
      floors: Object.keys(floors).map(floor => {
        const layoutForFloor = normalizedLayout?.[floor];
        const floorSeats = floors[floor].seats;
        const seatsByRow = {};
        floorSeats.forEach(seat => {
          const row = seat.position.row;
          if (!seatsByRow[row]) seatsByRow[row] = [];
          seatsByRow[row].push(seat);
        });
        
        return {
          floor,
          count: floorSeats.length,
          columns: floors[floor].columns,
          columnsFromLayout: layoutForFloor?.columns,
          rowsFromLayout: layoutForFloor?.rows,
          label: floors[floor].label,
          rowsCount: Object.keys(seatsByRow).length,
          seatsPerRow: Object.keys(seatsByRow).map(row => ({
            row: Number(row),
            count: seatsByRow[row].length,
            seats: seatsByRow[row].map(s => s.seatNumber || s.seat_number),
          })),
          sampleSeats: floorSeats.slice(0, 5).map(s => ({
            seatNumber: s.seatNumber || s.seat_number,
            row: s.position.row,
            col: s.position.col,
          })),
        };
      }),
    });

    return floors;
  }, [normalizedSeats, normalizedLayout]);

  const floorOrder = useMemo(() => {
    if (normalizedLayout) {
      const orderFromConfig = Object.values(normalizedLayout)
        .sort((a, b) => (a.floor || 0) - (b.floor || 0))
        .map(cfg => cfg.prefix)
        .filter(prefix => groupSeatsByFloor[prefix]);
      
      // Nếu có ghế nhưng không có trong config, thêm vào
      const allFloors = Object.keys(groupSeatsByFloor);
      const missingFloors = allFloors.filter(f => !orderFromConfig.includes(f));
      
      return [...orderFromConfig, ...missingFloors.sort()];
    }
    
    // Khi không có layout config, sắp xếp theo thứ tự A, B, C...
    return Object.keys(groupSeatsByFloor).sort((a, b) => {
      // A trước B, B trước C...
      return a.localeCompare(b);
    });
  }, [normalizedLayout, groupSeatsByFloor]);

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
              {selectedSeats.length > 0
                ? selectedSeats
                    .map((id) => {
                      const seat = seatsById.get(id);
                      return seat?.seatNumber || seat?.seat_number || id;
                    })
                    .join(", ")
                : "Chưa chọn ghế nào"}
            </p>
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
                alert(
                  `Bạn đã chọn ghế: ${selectedSeats.join(
                    ", "
                  )}. Tính năng đặt vé đang được phát triển.`
                );
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


