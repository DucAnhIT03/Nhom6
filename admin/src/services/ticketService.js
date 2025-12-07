import axiosClient from './axiosClient';

/**
 * Lấy danh sách vé
 * @param {Object} params - Query parameters (page, limit, userId, scheduleId, status)
 * @returns {Promise<Array>} Danh sách vé
 */
export async function getTickets(params = {}) {
  try {
    const response = await axiosClient.get('/tickets', { params });
    
    if (response?.success && response?.data) {
      if (response.data.items && Array.isArray(response.data.items)) {
        return response.data.items;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return [];
  }
}

/**
 * Lấy chi tiết vé
 * @param {number} id - ID vé
 * @returns {Promise<Object>} Thông tin vé
 */
export async function getTicket(id) {
  try {
    const response = await axiosClient.get(`/tickets/${id}`);
    
    if (response?.success && response?.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching ticket:', error);
    throw error;
  }
}

/**
 * Tạo vé mới (User - đặt vé online)
 * @param {Object} ticketData - Dữ liệu vé
 * @returns {Promise<Object>} Response từ server
 */
export async function createTicket(ticketData) {
  try {
    const payload = {
      userId: Number(ticketData.userId),
      scheduleId: Number(ticketData.scheduleId),
      seatId: Number(ticketData.seatId),
      departureTime: ticketData.departureTime,
      arrivalTime: ticketData.arrivalTime,
      seatType: ticketData.seatType,
      price: Number(ticketData.price),
      ...(ticketData.ticketCode && { ticketCode: ticketData.ticketCode }),
    };
    
    // Validate
    if (!payload.userId || !payload.scheduleId || !payload.seatId) {
      throw new Error('Thông tin vé không đầy đủ');
    }
    if (!payload.departureTime || !payload.arrivalTime) {
      throw new Error('Thời gian khởi hành và đến nơi không được để trống');
    }
    if (!payload.seatType || !payload.price) {
      throw new Error('Loại ghế và giá vé không được để trống');
    }
    
    const response = await axiosClient.post('/tickets', payload);
    return response;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
}

/**
 * Tạo vé tại quầy (Admin - xuất vé tại quầy)
 * @param {Object} ticketData - Dữ liệu vé
 * @returns {Promise<Object>} Response từ server
 */
export async function createTicketAtCounter(ticketData) {
  try {
    // Map seatType để đảm bảo chỉ gửi các giá trị backend chấp nhận: LUXURY, VIP, STANDARD
    const mapSeatType = (seatType) => {
      const type = (seatType || 'STANDARD').toUpperCase()
      // Backend chỉ chấp nhận: LUXURY, VIP, STANDARD
      if (type === 'LUXURY' || type === 'VIP' || type === 'STANDARD') {
        return type
      }
      // Map các giá trị khác về STANDARD
      return 'STANDARD'
    }
    
    const payload = {
      userId: Number(ticketData.userId),
      scheduleId: Number(ticketData.scheduleId),
      seatId: Number(ticketData.seatId),
      departureTime: ticketData.departureTime,
      arrivalTime: ticketData.arrivalTime,
      seatType: mapSeatType(ticketData.seatType), // Đảm bảo chỉ gửi LUXURY, VIP, hoặc STANDARD
      price: Number(ticketData.price),
      // Không gửi status - backend sẽ tự động set status cho vé tại quầy
      ...(ticketData.ticketCode && { ticketCode: ticketData.ticketCode }),
    };
    
    console.log('Creating ticket at counter with payload:', {
      ...payload,
      originalSeatType: ticketData.seatType,
      mappedSeatType: payload.seatType,
      note: 'Vé tại quầy - backend sẽ tự động set status, frontend sẽ hiển thị là "Thanh toán thành công"'
    });
    
    // Validate
    if (!payload.userId || !payload.scheduleId || !payload.seatId) {
      throw new Error('Thông tin vé không đầy đủ');
    }
    if (!payload.departureTime || !payload.arrivalTime) {
      throw new Error('Thời gian khởi hành và đến nơi không được để trống');
    }
    if (!payload.seatType || !payload.price) {
      throw new Error('Loại ghế và giá vé không được để trống');
    }
    
    const response = await axiosClient.post('/tickets/admin/counter', payload);
    return response;
  } catch (error) {
    console.error('Error creating ticket at counter:', error);
    throw error;
  }
}

/**
 * Cập nhật vé
 * @param {Object} updatedTicket - Dữ liệu vé cần cập nhật (phải có id)
 * @returns {Promise<Object>} Response từ server
 */
export async function updateTicket(updatedTicket) {
  try {
    const response = await axiosClient.put(`/tickets/${updatedTicket.id}`, updatedTicket);
    return response;
  } catch (error) {
    console.error('Error updating ticket:', error);
    throw error;
  }
}

/**
 * Xóa vé
 * @param {number} id - ID của vé
 * @returns {Promise<Object>} Response từ server
 */
export async function deleteTicket(id) {
  try {
    const response = await axiosClient.delete(`/tickets/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting ticket:', error);
    throw error;
  }
}

/**
 * Tra cứu vé
 * @param {string} ticketCode - Mã vé
 * @param {string} phone - Số điện thoại
 * @returns {Promise<Object>} Thông tin vé
 */
export async function lookupTicket(ticketCode, phone) {
  try {
    const response = await axiosClient.get('/tickets/lookup', {
      params: { ticketCode, phone }
    });
    
    if (response?.success && response?.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error looking up ticket:', error);
    throw error;
  }
}

/**
 * Hủy vé (đánh dấu thanh toán thất bại)
 * @param {number} id - ID của vé
 * @returns {Promise<Object>} Response từ server
 */
export async function cancelTicket(id) {
  try {
    // Backend chỉ chấp nhận BOOKED hoặc CANCELLED
    // Đánh dấu vé là thanh toán thất bại (sẽ hiển thị là "Thanh toán thất bại" trong frontend)
    const response = await axiosClient.put(`/tickets/${id}`, { status: 'CANCELLED' });
    return response;
  } catch (error) {
    console.error('Error cancelling ticket:', error);
    throw error;
  }
}

