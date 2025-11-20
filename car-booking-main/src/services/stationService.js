import axiosClient from './axiosClient';

/**
 * Lấy danh sách tất cả các bến xe
 * @returns {Promise<Array>} Danh sách bến xe
 */
export const getStations = async () => {
  try {
    const response = await axiosClient.get('/stations');
    // Backend trả về: { success: true, message: '...', data: { items: [...], total, page, limit, totalPages } }
    // Hoặc có thể là: { success: true, message: '...', data: [...] }
    
    if (response?.success && response?.data) {
      // Nếu data có items (paginated response)
      if (response.data.items && Array.isArray(response.data.items)) {
        return response.data.items;
      }
      // Nếu data là array trực tiếp
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }
    
    // Fallback: nếu response là array trực tiếp
    if (Array.isArray(response)) {
      return response;
    }
    
    // Nếu không có data, trả về array rỗng
    console.warn('Unexpected response format:', response);
    return [];
  } catch (error) {
    console.error('Error fetching stations:', error);
    // Trả về array rỗng thay vì throw để tránh crash
    return [];
  }
};

/**
 * Lấy thông tin chi tiết một bến xe theo ID
 * @param {number} id - ID của bến xe
 * @returns {Promise<Object>} Thông tin bến xe
 */
export const getStationById = async (id) => {
  try {
    const response = await axiosClient.get(`/stations/${id}`);
    return Array.isArray(response) ? response : response?.data || response;
  } catch (error) {
    console.error(`Error fetching station ${id}:`, error);
    throw error;
  }
};
