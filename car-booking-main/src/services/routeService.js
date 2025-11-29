import axiosClient from './axiosClient';

const mapRoute = (route) => ({
  id: route.id,
  departureStationId: route.departureStationId,
  arrivalStationId: route.arrivalStationId,
  busCompanyId: route.busCompanyId,
  price: route.price,
  duration: route.duration,
  distance: route.distance,
  departureStation: route.departureStation,
  arrivalStation: route.arrivalStation,
  busCompany: route.busCompany,
  createdAt: route.createdAt,
  updatedAt: route.updatedAt,
});

/**
 * Lấy danh sách tuyến đường với phân trang
 * @param {Object} params
 * @returns {Promise<{items: Array, total: number, page: number, totalPages: number, limit: number}>}
 */
export const getRoutes = async (params = {}) => {
  try {
    const response = await axiosClient.get('/routes', { params });
    let items = [];
    let meta = {
      total: 0,
      page: params.page || 1,
      totalPages: 1,
      limit: params.limit || 10,
    };

    if (response?.success && response?.data) {
      if (Array.isArray(response.data.items)) {
        items = response.data.items;
        meta = {
          total: response.data.total ?? items.length,
          page: response.data.page ?? meta.page,
          totalPages: response.data.totalPages ?? meta.totalPages,
          limit: response.data.limit ?? meta.limit,
        };
      } else if (Array.isArray(response.data)) {
        items = response.data;
        meta.total = items.length;
        meta.totalPages = Math.max(1, Math.ceil(items.length / meta.limit));
      }
    } else if (Array.isArray(response)) {
      items = response;
      meta.total = items.length;
      meta.totalPages = Math.max(1, Math.ceil(items.length / meta.limit));
    }

    return {
      items: items.map(mapRoute),
      ...meta,
    };
  } catch (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết một tuyến đường theo ID
 * @param {number} id - ID của tuyến đường
 * @returns {Promise<Object>} Thông tin tuyến đường
 */
export const getRouteById = async (id) => {
  try {
    const response = await axiosClient.get(`/routes/${id}`);
    
    if (response?.success && response?.data) {
      return mapRoute(response.data);
    }
    
    return response?.data || response;
  } catch (error) {
    console.error(`Error fetching route ${id}:`, error);
    throw error;
  }
};

