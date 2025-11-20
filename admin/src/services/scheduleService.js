import axiosClient from './axiosClient';

/**
 * Lấy danh sách lịch trình
 * @param {Object} params - Query parameters (page, limit, routeId, busId, departureDate, status, departureStationId, arrivalStationId)
 * @returns {Promise<Array>} Danh sách lịch trình
 */
export async function getSchedules(params = {}) {
  try {
    const response = await axiosClient.get('/schedules', { params });
    
    if (response?.success && response?.data) {
      if (response.data.items && Array.isArray(response.data.items)) {
        return response.data.items.map(schedule => ({
          id: schedule.id,
          route_id: schedule.routeId,
          bus_id: schedule.busId,
          start_date: schedule.startDate ? new Date(schedule.startDate).toISOString().split('T')[0] : '',
          end_date: schedule.endDate ? new Date(schedule.endDate).toISOString().split('T')[0] : '',
          departure_time: schedule.departureTime ? new Date(schedule.departureTime).toISOString() : '',
          arrival_time: schedule.arrivalTime ? new Date(schedule.arrivalTime).toISOString() : '',
          available_seat: schedule.availableSeat,
          total_seats: schedule.totalSeats,
          status: schedule.status,
          created_at: schedule.createdAt ? new Date(schedule.createdAt).toLocaleDateString('vi-VN') : '',
          updated_at: schedule.updatedAt ? new Date(schedule.updatedAt).toLocaleDateString('vi-VN') : '',
          // Route info
          route: schedule.route ? {
            id: schedule.route.id,
            departure_station: schedule.route.departureStation?.name || '',
            arrival_station: schedule.route.arrivalStation?.name || '',
            price: schedule.route.price,
            duration: schedule.route.duration,
            distance: schedule.route.distance,
          } : null,
          // Bus info
          bus: schedule.bus ? {
            id: schedule.bus.id,
            name: schedule.bus.name,
            license_plate: schedule.bus.licensePlate || schedule.bus.license_plate,
            capacity: schedule.bus.capacity,
            company: schedule.bus.company?.companyName || '',
          } : null,
        }));
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return [];
  }
}

/**
 * Lấy lịch trình sắp tới
 * @param {number} limit - Số lượng lịch trình
 * @returns {Promise<Array>} Danh sách lịch trình sắp tới
 */
export async function getUpcomingSchedules(limit = 10) {
  try {
    const response = await axiosClient.get('/schedules/upcoming', { params: { limit } });
    
    if (response?.success && response?.data) {
      if (Array.isArray(response.data)) {
        return response.data.map(schedule => ({
          id: schedule.id,
          route_id: schedule.routeId,
          bus_id: schedule.busId,
          departure_time: schedule.departureTime,
          arrival_time: schedule.arrivalTime,
          available_seat: schedule.availableSeat,
          total_seats: schedule.totalSeats,
          status: schedule.status,
          route: schedule.route,
          bus: schedule.bus,
        }));
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching upcoming schedules:', error);
    return [];
  }
}

/**
 * Lấy lịch trình theo tuyến và ngày
 * @param {number} routeId - ID tuyến đường
 * @param {string} date - Ngày (YYYY-MM-DD)
 * @returns {Promise<Array>} Danh sách lịch trình
 */
export async function getSchedulesByRouteAndDate(routeId, date) {
  try {
    const response = await axiosClient.get(`/schedules/route/${routeId}/date/${date}`);
    
    if (response?.success && response?.data) {
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching schedules by route and date:', error);
    return [];
  }
}

/**
 * Lấy chi tiết lịch trình
 * @param {number} id - ID lịch trình
 * @returns {Promise<Object>} Thông tin lịch trình
 */
export async function getSchedule(id) {
  try {
    const response = await axiosClient.get(`/schedules/${id}`);
    
    if (response?.success && response?.data) {
      return {
        id: response.data.id,
        route_id: response.data.routeId,
        bus_id: response.data.busId,
        start_date: response.data.startDate ? new Date(response.data.startDate).toISOString().split('T')[0] : '',
        end_date: response.data.endDate ? new Date(response.data.endDate).toISOString().split('T')[0] : '',
        departure_time: response.data.departureTime,
        arrival_time: response.data.arrivalTime,
        available_seat: response.data.availableSeat,
        total_seats: response.data.totalSeats,
        status: response.data.status,
        route: response.data.route,
        bus: response.data.bus,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    throw error;
  }
}

/**
 * Thêm lịch trình mới
 * @param {Object} scheduleData - Dữ liệu lịch trình
 * @returns {Promise<Object>} Response từ server
 */
export async function addSchedule(scheduleData) {
  try {
    const payload = {
      routeId: Number(scheduleData.route_id),
      busId: Number(scheduleData.bus_id),
      startDate: scheduleData.start_date,
      endDate: scheduleData.end_date,
      departureTime: scheduleData.departure_time,
      arrivalTime: scheduleData.arrival_time,
      totalSeats: Number(scheduleData.total_seats),
      ...(scheduleData.status && { status: scheduleData.status }),
    };
    
    // Validate
    if (!payload.routeId || !payload.busId) {
      throw new Error('Tuyến đường và xe không được để trống');
    }
    if (!payload.startDate || !payload.endDate) {
      throw new Error('Ngày bắt đầu và ngày kết thúc không được để trống');
    }
    if (!payload.departureTime || !payload.arrivalTime) {
      throw new Error('Thời gian khởi hành và đến nơi không được để trống');
    }
    if (!payload.totalSeats || payload.totalSeats <= 0) {
      throw new Error('Tổng số ghế phải lớn hơn 0');
    }
    
    const response = await axiosClient.post('/schedules', payload);
    return response;
  } catch (error) {
    console.error('Error adding schedule:', error);
    throw error;
  }
}

/**
 * Cập nhật lịch trình
 * @param {Object} updatedSchedule - Dữ liệu lịch trình cần cập nhật (phải có id)
 * @returns {Promise<Object>} Response từ server
 */
export async function updateSchedule(updatedSchedule) {
  try {
    const updateData = {};
    
    if (updatedSchedule.route_id !== undefined) {
      updateData.routeId = Number(updatedSchedule.route_id);
    }
    if (updatedSchedule.bus_id !== undefined) {
      updateData.busId = Number(updatedSchedule.bus_id);
    }
    if (updatedSchedule.start_date !== undefined) {
      updateData.startDate = updatedSchedule.start_date;
    }
    if (updatedSchedule.end_date !== undefined) {
      updateData.endDate = updatedSchedule.end_date;
    }
    if (updatedSchedule.departure_time !== undefined) {
      updateData.departureTime = updatedSchedule.departure_time;
    }
    if (updatedSchedule.arrival_time !== undefined) {
      updateData.arrivalTime = updatedSchedule.arrival_time;
    }
    if (updatedSchedule.available_seat !== undefined) {
      updateData.availableSeat = Number(updatedSchedule.available_seat);
    }
    if (updatedSchedule.total_seats !== undefined) {
      updateData.totalSeats = Number(updatedSchedule.total_seats);
    }
    if (updatedSchedule.status !== undefined) {
      updateData.status = updatedSchedule.status;
    }
    
    const response = await axiosClient.put(`/schedules/${updatedSchedule.id}`, updateData);
    return response;
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
}

/**
 * Hủy lịch trình
 * @param {number} id - ID của lịch trình
 * @returns {Promise<Object>} Response từ server
 */
export async function cancelSchedule(id) {
  try {
    const response = await axiosClient.patch(`/schedules/${id}/cancel`);
    return response;
  } catch (error) {
    console.error('Error cancelling schedule:', error);
    throw error;
  }
}

/**
 * Cập nhật số ghế trống
 * @param {number} id - ID của lịch trình
 * @param {number} seatsToBook - Số ghế cần đặt
 * @returns {Promise<Object>} Response từ server
 */
export async function updateAvailableSeats(id, seatsToBook) {
  try {
    const response = await axiosClient.patch(`/schedules/${id}/seats`, {
      seatsToBook: Number(seatsToBook),
    });
    return response;
  } catch (error) {
    console.error('Error updating available seats:', error);
    throw error;
  }
}

/**
 * Xóa lịch trình
 * @param {number} id - ID của lịch trình
 * @returns {Promise<Object>} Response từ server
 */
export async function deleteSchedule(id) {
  try {
    const response = await axiosClient.delete(`/schedules/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting schedule:', error);
    throw error;
  }
}



