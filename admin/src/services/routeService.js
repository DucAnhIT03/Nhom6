import axiosClient from './axiosClient';

/**
 * Lấy danh sách tuyến đường
 * @param {Object} params - Query parameters (page, limit, departureStationId, arrivalStationId, minPrice, maxPrice)
 * @returns {Promise<Array>} Danh sách tuyến đường
 */
export async function getRoutes(params = {}) {
  try {
    const response = await axiosClient.get('/routes', { params });
    
    if (response?.success && response?.data) {
      // Backend trả về: { success: true, data: { items: [...], total, page, limit, totalPages } }
      if (response.data.items && Array.isArray(response.data.items)) {
        return response.data.items.map(route => ({
          id: route.id,
          departure_station_id: route.departureStationId,
          arrival_station_id: route.arrivalStationId,
          bus_company_id: route.busCompanyId,
          departure_station: route.departureStation?.name || '',
          arrival_station: route.arrivalStation?.name || '',
          bus_company: route.busCompany?.companyName || '',
          bus_company_image: route.busCompany?.image || '',
          price: route.price,
          duration: route.duration,
          distance: route.distance,
          created_at: route.createdAt ? new Date(route.createdAt).toLocaleDateString('vi-VN') : '',
          updated_at: route.updatedAt ? new Date(route.updatedAt).toLocaleDateString('vi-VN') : '',
        }));
      }
      // Nếu data là array trực tiếp
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching routes:', error);
    return [];
  }
}

/**
 * Thêm tuyến đường mới
 * @param {Object} routeData - Dữ liệu tuyến đường
 * @returns {Promise<Object>} Response từ server
 */
export async function addRoute(routeData) {
  try {
    // Đảm bảo tất cả giá trị đều là number
    const payload = {
      departureStationId: Number(routeData.departure_station_id),
      arrivalStationId: Number(routeData.arrival_station_id),
      duration: Number(routeData.duration),
      distance: Number(routeData.distance),
      busCompanyId: Number(routeData.bus_company_id),
    };
    
    // Chỉ thêm price nếu có trong routeData
    if (routeData.price !== undefined && routeData.price !== null && routeData.price !== '') {
      payload.price = Number(routeData.price);
    }
    
    // Validate trước khi gửi
    if (!payload.departureStationId || !payload.arrivalStationId) {
      throw new Error('Điểm đi và điểm đến không được để trống');
    }
    if (isNaN(payload.duration) || payload.duration <= 0) {
      throw new Error('Thời gian không hợp lệ');
    }
    if (isNaN(payload.distance) || payload.distance <= 0) {
      throw new Error('Khoảng cách không hợp lệ');
    }
    
    console.log('Sending route data:', payload);
    const response = await axiosClient.post('/routes', payload);
    console.log('Route created successfully:', response);
    return response;
  } catch (error) {
    console.error('Error adding route:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

/**
 * Cập nhật tuyến đường
 * @param {Object} updatedRoute - Dữ liệu tuyến đường cần cập nhật (phải có id)
 * @returns {Promise<Object>} Response từ server
 */
export async function updateRoute(updatedRoute) {
  try {
    const updateData = {};
    
    if (updatedRoute.departure_station_id !== undefined) {
      updateData.departureStationId = Number(updatedRoute.departure_station_id);
    }
    if (updatedRoute.arrival_station_id !== undefined) {
      updateData.arrivalStationId = Number(updatedRoute.arrival_station_id);
    }
    if (updatedRoute.price !== undefined) {
      updateData.price = Number(updatedRoute.price);
    }
    if (updatedRoute.duration !== undefined) {
      updateData.duration = Number(updatedRoute.duration);
    }
    if (updatedRoute.distance !== undefined) {
      updateData.distance = Number(updatedRoute.distance);
    }
    if (updatedRoute.bus_company_id !== undefined) {
      updateData.busCompanyId = Number(updatedRoute.bus_company_id);
    }
    
    const response = await axiosClient.put(`/routes/${updatedRoute.id}`, updateData);
    return response;
  } catch (error) {
    console.error('Error updating route:', error);
    throw error;
  }
}

/**
 * Xóa tuyến đường
 * @param {number} id - ID của tuyến đường
 * @returns {Promise<Object>} Response từ server
 */
export async function deleteRoute(id) {
  try {
    const response = await axiosClient.delete(`/routes/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting route:', error);
    throw error;
  }
}

/**
 * Cập nhật giá vé hàng loạt
 * @param {Object} bulkUpdateData - Dữ liệu cập nhật giá vé hàng loạt
 * @returns {Promise<Object>} Response từ server
 */
export async function bulkUpdatePrice(bulkUpdateData) {
  try {
    const payload = {
      newPrice: Number(bulkUpdateData.newPrice),
      ...(bulkUpdateData.busCompanyId && { busCompanyId: Number(bulkUpdateData.busCompanyId) }),
      ...(bulkUpdateData.routeIds && bulkUpdateData.routeIds.length > 0 && { routeIds: bulkUpdateData.routeIds.map(id => Number(id)) }),
      ...(bulkUpdateData.busIds && bulkUpdateData.busIds.length > 0 && { busIds: bulkUpdateData.busIds.map(id => Number(id)) }),
      ...(bulkUpdateData.departureStationId && { departureStationId: Number(bulkUpdateData.departureStationId) }),
      ...(bulkUpdateData.arrivalStationId && { arrivalStationId: Number(bulkUpdateData.arrivalStationId) }),
    };

    if (!payload.newPrice || payload.newPrice < 0) {
      throw new Error('Giá vé mới không hợp lệ');
    }

    const response = await axiosClient.put('/routes/prices/bulk', payload);
    return response;
  } catch (error) {
    console.error('Error bulk updating price:', error);
    throw error;
  }
}
