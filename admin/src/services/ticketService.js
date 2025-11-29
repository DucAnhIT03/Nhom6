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

