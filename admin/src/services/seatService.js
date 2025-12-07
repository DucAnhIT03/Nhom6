import axiosClient from './axiosClient';

/**
 * Lấy danh sách ghế
 * @param {Object} params - Query parameters (page, limit, busId, seatType, status)
 * @returns {Promise<Array>} Danh sách ghế
 */
export async function getSeats(params = {}) {
  try {
    const response = await axiosClient.get('/seats', { params });

    if (response?.success && response?.data) {
      if (response.data.items && Array.isArray(response.data.items)) {
        return response.data.items.map(seat => ({
          id: seat.id,
          bus_id: seat.busId,
          bus_name: seat.bus?.name || '',
          seat_number: seat.seatNumber,
          seat_type: seat.seatType,
          status: seat.status,
          price_for_seat_type: seat.priceForSeatType || 0,
          created_at: seat.createdAt ? new Date(seat.createdAt).toLocaleDateString('vi-VN') : '',
          updated_at: seat.updatedAt ? new Date(seat.updatedAt).toLocaleDateString('vi-VN') : '',
        }));
      }
      if (Array.isArray(response.data)) {
        return response.data.map(seat => ({
          id: seat.id,
          bus_id: seat.busId,
          bus_name: seat.bus?.name || '',
          seat_number: seat.seatNumber,
          seat_type: seat.seatType,
          status: seat.status,
          price_for_seat_type: seat.priceForSeatType || 0,
          created_at: seat.createdAt ? new Date(seat.createdAt).toLocaleDateString('vi-VN') : '',
          updated_at: seat.updatedAt ? new Date(seat.updatedAt).toLocaleDateString('vi-VN') : '',
        }));
      }
    }

    return [];
  } catch (error) {
    console.error('Error fetching seats:', error);
    return [];
  }
}

/**
 * Lấy sơ đồ ghế theo busId
 * @param {number} busId - ID của xe
 * @param {number} scheduleId - ID của lịch trình (optional, để lấy trạng thái ghế đã đặt)
 * @returns {Promise<Object>} Sơ đồ ghế với màu sắc
 */
export async function getSeatMap(busId, scheduleId = null) {
  try {
    const params = scheduleId ? { scheduleId } : {};
    const response = await axiosClient.get(`/seats/bus/${busId}`, { params });

    if (response?.success && response?.data) {
      return {
        busId: response.data.busId,
        busName: response.data.busName,
        seats: response.data.seats || [],
        seatMap: response.data.seatMap || {},
        layoutConfig: response.data.layoutConfig || null,
      };
    }

    return { busId, busName: '', seats: [], seatMap: {}, layoutConfig: null };
  } catch (error) {
    console.error('Error fetching seat map:', error);
    return { busId, busName: '', seats: [], seatMap: {}, layoutConfig: null };
  }
}

/**
 * Thêm ghế mới
 * @param {Object} seatData - Dữ liệu ghế
 * @returns {Promise<Object>} Response từ server
 */
export async function addSeat(seatData) {
  try {
    const payload = {
      busId: Number(seatData.bus_id),
      seatNumber: seatData.seat_number,
      seatType: seatData.seat_type || 'STANDARD',
      priceForSeatType: Number(seatData.price_for_seat_type) || 0,
    };

    if (!payload.busId || !payload.seatNumber) {
      throw new Error('ID xe và số ghế không được để trống');
    }

    const response = await axiosClient.post('/seats', payload);
    return response;
  } catch (error) {
    console.error('Error adding seat:', error);
    throw error;
  }
}

/**
 * Thêm nhiều ghế cùng lúc
 * @param {Array} seatsData - Mảng dữ liệu ghế
 * @returns {Promise<Object>} Response từ server
 */
export async function addSeatsBulk(seatsData) {
  try {
    const payload = seatsData.map(seat => ({
      busId: Number(seat.bus_id),
      seatNumber: seat.seat_number,
      seatType: seat.seat_type || 'STANDARD',
      priceForSeatType: Number(seat.price_for_seat_type) || 0,
    }));

    const response = await axiosClient.post('/seats/bulk', payload);
    return response;
  } catch (error) {
    console.error('Error adding seats bulk:', error);
    throw error;
  }
}

/**
 * Cập nhật ghế
 * @param {Object} updatedSeat - Dữ liệu ghế cần cập nhật (phải có id)
 * @returns {Promise<Object>} Response từ server
 */
export async function updateSeat(updatedSeat) {
  try {
    const updateData = {};

    if (updatedSeat.seat_number !== undefined) {
      updateData.seatNumber = updatedSeat.seat_number;
    }
    if (updatedSeat.seat_type !== undefined) {
      updateData.seatType = updatedSeat.seat_type;
    }
    if (updatedSeat.status !== undefined) {
      updateData.status = updatedSeat.status;
    }
    if (updatedSeat.price_for_seat_type !== undefined) {
      updateData.priceForSeatType = Number(updatedSeat.price_for_seat_type);
    }
    if (updatedSeat.is_hidden !== undefined) {
      updateData.isHidden = Boolean(updatedSeat.is_hidden);
    }

    const response = await axiosClient.put(`/seats/${updatedSeat.id}`, updateData);
    return response;
  } catch (error) {
    console.error('Error updating seat:', error);
    throw error;
  }
}

/**
 * Cập nhật nhiều ghế cùng lúc
 * @param {Array} updates - Mảng các object { id, data: { seat_type, price_for_seat_type, is_hidden, ... } }
 * @returns {Promise<Object>} Response từ server
 */
export async function updateSeatsBulk(payload) {
  try {
    const normalizedPayload = {
      seats: (payload?.seats || []).map(item => ({
        id: Number(item.id),
        data: {
          ...(item.data?.seatType !== undefined && { seatType: item.data.seatType }),
          ...(item.data?.isHidden !== undefined && { isHidden: Boolean(item.data.isHidden) }),
        },
      })),
    };

    const response = await axiosClient.put('/seats/bulk', normalizedPayload);
    return response;
  } catch (error) {
    console.error('Error updating seats bulk:', error);
    throw error;
  }
}

/**
 * Xóa ghế
 * @param {number} id - ID của ghế
 * @returns {Promise<Object>} Response từ server
 */
export async function deleteSeat(id) {
  try {
    const response = await axiosClient.delete(`/seats/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting seat:', error);
    throw error;
  }
}

/**
 * Xóa toàn bộ sơ đồ ghế của một xe
 * @param {number} busId
 * @returns {Promise<Object>}
 */
export async function deleteSeatMap(busId) {
  try {
    const response = await axiosClient.delete(`/seats/bus/${busId}`);
    return response;
  } catch (error) {
    console.error('Error deleting seat map:', error);
    throw error;
  }
}


