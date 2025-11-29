import axiosClient from './axiosClient';

/**
 * Lấy danh sách tất cả các nhà xe
 * @param {Object} params - Query parameters (page, limit, search)
 * @returns {Promise<Array>} Danh sách nhà xe
 */
export const getBusCompanies = async (params = {}) => {
  try {
    const response = await axiosClient.get('/bus-companies', { params });
    
    // Backend trả về: { success: true, message: '...', data: { items: [...], total, page, limit, totalPages } }
    if (response?.success && response?.data) {
      // Nếu data có items (paginated response)
      if (response.data.items && Array.isArray(response.data.items)) {
        return response.data.items.map(company => ({
          id: company.id,
          name: company.companyName,
          company_name: company.companyName,
          image: company.image || '',
          descriptions: company.descriptions || '',
          address: company.address || '', // Địa chỉ trụ sở
          createdAt: company.createdAt,
          updatedAt: company.updatedAt,
        }));
      }
      // Nếu data là array trực tiếp
      if (Array.isArray(response.data)) {
        return response.data.map(company => ({
          id: company.id,
          name: company.companyName || company.company_name,
          company_name: company.companyName || company.company_name,
          image: company.image || '',
          descriptions: company.descriptions || '',
          address: company.address || '',
          createdAt: company.createdAt,
          updatedAt: company.updatedAt,
        }));
      }
    }
    
    // Fallback: nếu response là array trực tiếp
    if (Array.isArray(response)) {
      return response.map(company => ({
        id: company.id,
        name: company.companyName || company.company_name,
        company_name: company.companyName || company.company_name,
        image: company.image || '',
        descriptions: company.descriptions || '',
        address: company.address || '',
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      }));
    }
    
    // Nếu không có data, trả về array rỗng
    console.warn('Unexpected response format:', response);
    return [];
  } catch (error) {
    console.error('Error fetching bus companies:', error);
    // Trả về array rỗng thay vì throw để tránh crash
    return [];
  }
};

/**
 * Lấy thông tin chi tiết một nhà xe theo ID
 * @param {number} id - ID của nhà xe
 * @returns {Promise<Object>} Thông tin nhà xe
 */
export const getBusCompanyById = async (id) => {
  try {
    const response = await axiosClient.get(`/bus-companies/${id}`);
    
    if (response?.success && response?.data) {
      const company = response.data;
      return {
        id: company.id,
        name: company.companyName,
        company_name: company.companyName,
        image: company.image || '',
        descriptions: company.descriptions || '',
        address: company.address || '',
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      };
    }
    
    return response?.data || response;
  } catch (error) {
    console.error(`Error fetching bus company ${id}:`, error);
    throw error;
  }
};

