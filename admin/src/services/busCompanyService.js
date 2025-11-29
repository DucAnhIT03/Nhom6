import axiosClient from './axiosClient';

/**
 * Lấy danh sách nhà xe
 * @param {Object} params - Query parameters (page, limit, search)
 * @returns {Promise<Array>} Danh sách nhà xe
 */
export async function getCompanies(params = {}) {
  try {
    const response = await axiosClient.get('/bus-companies', { params });
    
    if (response?.success && response?.data) {
      // Backend trả về: { success: true, data: { items: [...], total, page, limit, totalPages } }
      if (response.data.items && Array.isArray(response.data.items)) {
        return response.data.items.map(company => ({
          id: company.id,
          company_name: company.companyName,
          image: company.image || '',
          address: company.address || '',
          descriptions: company.descriptions || '',
          created_at: company.createdAt ? new Date(company.createdAt).toLocaleDateString('vi-VN') : '',
          updated_at: company.updatedAt ? new Date(company.updatedAt).toLocaleDateString('vi-VN') : '',
        }));
      }
      // Nếu data là array trực tiếp
      if (Array.isArray(response.data)) {
        return response.data.map(company => ({
          id: company.id,
          company_name: company.companyName || company.company_name,
          image: company.image || '',
          address: company.address || '',
          descriptions: company.descriptions || '',
          created_at: company.createdAt ? new Date(company.createdAt).toLocaleDateString('vi-VN') : '',
          updated_at: company.updatedAt ? new Date(company.updatedAt).toLocaleDateString('vi-VN') : '',
        }));
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
}

/**
 * Thêm nhà xe mới
 * @param {Object} companyData - Dữ liệu nhà xe
 * @returns {Promise<Object>} Response từ server
 */
export async function addCompany(companyData) {
  try {
    const payload = {
      companyName: companyData.company_name,
      image: companyData.image || undefined,
      address: companyData.address || undefined,
      descriptions: companyData.descriptions || undefined,
    };
    
    console.log('Adding company with data:', payload);
    const response = await axiosClient.post('/bus-companies', payload);
    console.log('Company added successfully:', response);
    return response;
  } catch (error) {
    console.error('Error adding company:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

/**
 * Cập nhật nhà xe
 * @param {Object} updatedCompany - Dữ liệu nhà xe cần cập nhật (phải có id)
 * @returns {Promise<Object>} Response từ server
 */
export async function updateCompany(updatedCompany) {
  try {
    const updateData = {};
    
    if (updatedCompany.company_name !== undefined) {
      updateData.companyName = updatedCompany.company_name;
    }
    if (updatedCompany.image !== undefined) {
      updateData.image = updatedCompany.image;
    }
    if (updatedCompany.address !== undefined) {
      updateData.address = updatedCompany.address;
    }
    if (updatedCompany.descriptions !== undefined) {
      updateData.descriptions = updatedCompany.descriptions;
    }
    
    console.log('Updating company:', updatedCompany.id, 'with data:', updateData);
    const response = await axiosClient.put(`/bus-companies/${updatedCompany.id}`, updateData);
    console.log('Company updated successfully:', response);
    return response;
  } catch (error) {
    console.error('Error updating company:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

/**
 * Xóa nhà xe
 * @param {number} id - ID của nhà xe
 * @returns {Promise<Object>} Response từ server
 */
export async function deleteCompany(id) {
  try {
    const response = await axiosClient.delete(`/bus-companies/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting company:', error);
    throw error;
  }
}
