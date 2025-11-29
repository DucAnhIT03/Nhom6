import axiosClient from './axiosClient';

/**
 * Lấy danh sách xe
 * @param {Object} params - Query parameters (page, limit, search, companyId)
 * @returns {Promise<Array>} Danh sách xe
 */
export async function getBuses(params = {}) {
  try {
    const response = await axiosClient.get('/buses', { params });
    
    if (response?.success && response?.data) {
      // Backend trả về: { success: true, data: { items: [...], total, page, limit, totalPages } }
      if (response.data.items && Array.isArray(response.data.items)) {
        return response.data.items.map(bus => ({
          id: bus.id,
          name: bus.name,
          descriptions: bus.descriptions || '',
          license_plate: bus.licensePlate,
          capacity: bus.capacity,
          floors: bus.floors || 2,
          company_id: bus.companyId,
          company: bus.company?.companyName || '',
          seatLayoutConfig: bus.seatLayoutConfig || null,
          created_at: bus.createdAt ? new Date(bus.createdAt).toLocaleDateString('vi-VN') : '',
          updated_at: bus.updatedAt ? new Date(bus.updatedAt).toLocaleDateString('vi-VN') : '',
        }));
      }
      // Nếu data là array trực tiếp
      if (Array.isArray(response.data)) {
        return response.data.map(bus => ({
          id: bus.id,
          name: bus.name,
          descriptions: bus.descriptions || '',
          license_plate: bus.licensePlate || bus.license_plate,
          capacity: bus.capacity,
          floors: bus.floors || 2,
          company_id: bus.companyId || bus.company_id,
          company: bus.company?.companyName || bus.company || '',
          seatLayoutConfig: bus.seatLayoutConfig || null,
          created_at: bus.createdAt ? new Date(bus.createdAt).toLocaleDateString('vi-VN') : '',
          updated_at: bus.updatedAt ? new Date(bus.updatedAt).toLocaleDateString('vi-VN') : '',
        }));
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching buses:', error);
    return [];
  }
}

/**
 * Thêm xe mới
 * @param {Object} busData - Dữ liệu xe
 * @returns {Promise<Object>} Response từ server
 */
export async function addBus(busData) {
  try {
          const payload = {
            name: busData.name,
            descriptions: busData.descriptions || undefined,
            licensePlate: busData.license_plate,
            capacity: Number(busData.capacity),
            companyId: Number(busData.company_id),
            floors: Number(busData.floors) || 2,
          };
    
    // Validate trước khi gửi
    if (!payload.name || !payload.licensePlate) {
      throw new Error('Tên xe và biển số không được để trống');
    }
    if (isNaN(payload.capacity) || payload.capacity <= 0) {
      throw new Error('Sức chứa phải là số lớn hơn 0');
    }
    if (isNaN(payload.companyId) || payload.companyId <= 0) {
      throw new Error('Nhà xe không hợp lệ');
    }
    
    console.log('Sending bus data:', payload);
    const response = await axiosClient.post('/buses', payload);
    console.log('Bus created successfully:', response);
    return response;
  } catch (error) {
    console.error('Error adding bus:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

/**
 * Cập nhật xe
 * @param {Object} updatedBus - Dữ liệu xe cần cập nhật (phải có id)
 * @returns {Promise<Object>} Response từ server
 */
export async function updateBus(updatedBus) {
  try {
    const updateData = {};
    
    if (updatedBus.name !== undefined) {
      updateData.name = updatedBus.name;
    }
    if (updatedBus.descriptions !== undefined) {
      updateData.descriptions = updatedBus.descriptions || undefined;
    }
    if (updatedBus.license_plate !== undefined) {
      updateData.licensePlate = updatedBus.license_plate;
    }
    if (updatedBus.capacity !== undefined) {
      updateData.capacity = Number(updatedBus.capacity);
      if (isNaN(updateData.capacity) || updateData.capacity <= 0) {
        throw new Error('Sức chứa phải là số lớn hơn 0');
      }
    }
          if (updatedBus.company_id !== undefined) {
            updateData.companyId = Number(updatedBus.company_id);
            if (isNaN(updateData.companyId) || updateData.companyId <= 0) {
              throw new Error('Nhà xe không hợp lệ');
            }
          }
          if (updatedBus.floors !== undefined) {
            updateData.floors = Number(updatedBus.floors);
            if (isNaN(updateData.floors) || (updateData.floors !== 1 && updateData.floors !== 2)) {
              throw new Error('Số tầng phải là 1 hoặc 2');
            }
          }
    
    console.log('Updating bus:', updatedBus.id, 'with data:', updateData);
    const response = await axiosClient.put(`/buses/${updatedBus.id}`, updateData);
    console.log('Bus updated successfully:', response);
    return response;
  } catch (error) {
    console.error('Error updating bus:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

/**
 * Xóa xe
 * @param {number} id - ID của xe
 * @returns {Promise<Object>} Response từ server
 */
export async function deleteBus(id) {
  try {
    const response = await axiosClient.delete(`/buses/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting bus:', error);
    throw error;
  }
}

/**
 * Cập nhật layout config của xe
 * @param {number} busId - ID của xe
 * @param {Object} layoutConfig - Cấu hình layout: { floors, floorConfigs: [...] }
 * @returns {Promise<Object>} Response từ server
 */
export async function updateBusLayoutConfig(busId, layoutConfig) {
  try {
    const response = await axiosClient.put(`/buses/${busId}`, {
      seatLayoutConfig: layoutConfig,
    });
    return response;
  } catch (error) {
    console.error('Error updating bus layout config:', error);
    throw error;
  }
}