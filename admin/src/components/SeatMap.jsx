
import React, { useMemo } from 'react';


/**
 * Component hiển thị sơ đồ ghế với màu sắc
 * @param {Object} props
 * @param {Object} props.seatMap - Map ghế với màu sắc { [seatNumber]: { seat, color } }
 * @param {Array} props.seats - Danh sách ghế
 * @param {Function} props.onSeatClick - Callback khi click vào ghế (optional)
 * @param {Function} props.onSeatEdit - Callback khi chỉnh sửa ghế (optional) - nhận (seat) và mở modal
 * @param {Array} props.selectedSeats - Danh sách ID ghế đã chọn (optional)
 * @param {Function} props.onSeatSelect - Callback khi chọn/bỏ chọn ghế (optional) - nhận (seatId, isSelected)
 * @param {Boolean} props.multiSelect - Cho phép chọn nhiều ghế (optional)
 * @param {Object} props.layoutConfig - Cấu hình hàng/cột cho từng tầng
 * @param {Boolean} props.showLegend - Hiển thị legend (mặc định: true)
 */
export default function SeatMap({
  seatMap = {},
  seats = [],
  onSeatClick,
  onSeatEdit,
  selectedSeats = [],
  onSeatSelect,
  multiSelect = false,
  layoutConfig = null,
  showLegend = true,
}) {
  // Hàm chuyển đổi loại ghế sang tiếng Việt
  const getSeatTypeLabel = (seatType) => {
    const types = {
      'STANDARD': 'Thường',
      'VIP': 'VIP',
      'DOUBLE': 'Đôi',
      'LUXURY': 'Luxury'
    };
    return types[seatType] || seatType || 'Thường';
  };

  // Màu sắc mặc định
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

  const parseSeatPosition = (seatNumber, fallbackIndex = 0) => {
    const layout = findLayoutForSeat(seatNumber);
    if (layout) {
      const numericPart = seatNumber.substring(layout.prefix.length);
      const order = parseInt(numericPart, 10);
      const columns = Math.max(1, Number(layout.columns) || 1);
      if (order && order > 0) {
        const row = Math.floor((order - 1) / columns) + 1;
        const col = ((order - 1) % columns) + 1;
        return {
          floor: layout.prefix,
          row,
          col,
          display: numericPart || order.toString().padStart(2, '0'),
          columns,
        };
      }
    }

    // Fallback parsing giống logic cũ
    const floorMatch = seatNumber.match(/^([A-Z]+)/i);
    const floor = floorMatch ? floorMatch[1].toUpperCase() : (seatNumber.charAt(0).toUpperCase() || `F${fallbackIndex}`);
    const numStr = seatNumber.substring(floor.length);
    const num = parseInt(numStr, 10) || fallbackIndex + 1;
    const colsPerRow = 3;
    const row = Math.ceil(num / colsPerRow) || 1;
    const col = ((num - 1) % colsPerRow) + 1;

    return {
      floor,
      row,
      col,
      display: numStr || num.toString().padStart(2, '0'),
      columns: colsPerRow,
    };
  };

  // Nhóm ghế theo tầng và sắp xếp theo hàng, cột
  const groupSeatsByFloor = () => {
    const floors = {};
    
    seats.forEach((seat, index) => {
      const seatNumber = seat.seatNumber || seat.seat_number || '';
      const pos = parseSeatPosition(seatNumber, index);
      const floor = pos.floor;
      if (!floors[floor]) {
        floors[floor] = {
          seats: [],
          columns: pos.columns || 3,
          label: normalizedLayout?.[floor]?.label || defaultFloorNames[floor] || `Tầng ${floor}`,
        };
      }
      const seatWithPos = {
        ...seat,
        position: pos,
      };
      floors[floor].columns = normalizedLayout?.[floor]?.columns || floors[floor].columns || pos.columns || 3;
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

    return floors;
  };

  const floors = groupSeatsByFloor();
  const floorOrder = useMemo(() => {
    if (normalizedLayout) {
      return Object.values(normalizedLayout)
        .sort((a, b) => (a.floor || 0) - (b.floor || 0))
        .map(cfg => cfg.prefix)
        .filter(prefix => floors[prefix]);
    }
    return Object.keys(floors);
  }, [normalizedLayout, floors]);

  const handleSeatClick = (seat, event) => {
    // Nếu đang ở chế độ chọn nhiều và ghế chưa bán
    if (multiSelect && onSeatSelect && seat.status !== 'BOOKED') {
      const isSelected = selectedSeats.includes(seat.id);
      onSeatSelect(seat.id, !isSelected);
      return;
    }

    if (seat.status === 'BOOKED') {
      // Vẫn cho phép xem thông tin ghế đã bán nhưng không cho chỉnh sửa
      if (onSeatEdit) {
        onSeatEdit(seat);
      }
      return;
    }

    // Nếu có onSeatEdit và không phải chế độ chọn nhiều, mở modal chỉnh sửa
    if (onSeatEdit && !multiSelect) {
      onSeatEdit(seat);
    } else if (onSeatClick) {
      onSeatClick(seat);
    }
  };

  return (
    <div className="w-full">
      {/* Legend */}
      {showLegend && (
      <div className="mb-6 flex flex-wrap gap-4 justify-center p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: '#9ca3af' }}></div>
          <span className="text-sm font-medium">Đã bán</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: '#bfdbfe' }}></div>
          <span className="text-sm font-medium">Ghế thường</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: '#fef08a' }}></div>
          <span className="text-sm font-medium">Ghế VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: '#fbcfe8' }}></div>
          <span className="text-sm font-medium">Ghế đôi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center" style={{ backgroundColor: '#e5e7eb' }}>
            <span className="text-red-600 font-bold text-xs">✕</span>
          </div>
          <span className="text-sm font-medium">Đã ẩn</span>
        </div>
        <div className="text-xs text-gray-500 mt-1 w-full text-center">
          💡 Click vào ghế để chỉnh sửa (loại ghế, giá, ẩn/hiện ghế)
        </div>
      </div>
      )}

      {/* Seat Map */}
      {Object.keys(floors).length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Chưa có ghế nào được thiết lập cho xe này</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {floorOrder.map(floorKey => {
            const floorData = floors[floorKey];
            if (!floorData) return null;
            const { seats: floorSeats, columns } = floorData;
            const seatsByCol = Array.from({ length: columns }, () => []);
            floorSeats.forEach(seat => {
              const col = Math.min(Math.max(seat.position.col, 1), columns);
              seatsByCol[col - 1].push(seat);
            });

            seatsByCol.forEach(colSeats => colSeats.sort((a, b) => a.position.row - b.position.row));

            return (
              <div key={floorKey} className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 text-center">
                  {floorData.label || defaultFloorNames[floorKey] || `Tầng ${floorKey}`}
                </h3>
                {floorSeats.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    <p>Chưa có ghế</p>
                  </div>
                ) : (
                  <div className="flex gap-3 justify-center">
                    {seatsByCol.map((colSeats, colIndex) => (
                      <div key={`${floorKey}-col-${colIndex}`} className="flex flex-col gap-2">
                        {colSeats.map(seat => {
                          const isHidden = seat.isHidden || seat.is_hidden || false;
                          const isSelected = selectedSeats.includes(seat.id);
                          const seatType = seat.seatType || seat.seat_type || 'STANDARD';
                          const status = seat.status || 'AVAILABLE';
                          const seatNumber = seat.seatNumber || seat.seat_number || '';
                          const backendColor = seatMap?.[seatNumber]?.color;
                          const baseColor = backendColor || getSeatColor(seatType, status, isHidden, false);
                          const seatColor = isSelected ? '#c4b5fd' : baseColor;
                          const isBooked = status === 'BOOKED';
                          return (
                            <div key={seat.id} className="relative">
                              <button
                                type="button"
                                onClick={(e) => handleSeatClick(seat, e)}
                                disabled={isBooked}
                                className={`
                                  w-12 h-12 rounded-lg border-2 font-semibold text-xs
                                  transition-all duration-200 flex items-center justify-center relative
                                  ${!isBooked ? 'cursor-pointer hover:scale-110 hover:shadow-md' : 'cursor-not-allowed'}
                                  ${isBooked ? 'opacity-60' : ''}
                                  ${isHidden ? 'opacity-50' : ''}
                                  ${isSelected ? 'ring-2 ring-purple-500 ring-offset-2' : ''}
                                `}
                                style={{
                                  backgroundColor: seatColor,
                                  borderColor: isSelected ? '#a78bfa' : isBooked ? '#6b7280' : isHidden ? '#d1d5db' : '#e5e7eb',
                                  color: isBooked ? '#ffffff' : isHidden ? '#9ca3af' : '#1f2937',
                                }}
                                title={`${seatNumber} - ${getSeatTypeLabel(seatType)} - ${isHidden ? 'Đã ẩn' : status === 'BOOKED' ? 'Đã bán' : 'Còn trống'}${multiSelect && !isBooked ? ' (Click để chọn)' : ' (Click để chỉnh sửa)'}`}
                              >
                                {isHidden ? (
                                  <span className="text-red-600 font-bold text-lg">✕</span>
                                ) : (
                                  <>
                                    {multiSelect && isSelected && (
                                      <span className="absolute top-0 right-0 bg-purple-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs shadow-lg">✓</span>
                                    )}
                                    {multiSelect && !isSelected && status !== 'BOOKED' && (
                                      <span className="absolute inset-0 rounded-lg border border-dashed border-purple-300 pointer-events-none"></span>
                                    )}
                                    {seat.position.display}
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}















