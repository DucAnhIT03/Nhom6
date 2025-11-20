import axiosClient from './axiosClient';

/**
 * Lấy tất cả quan hệ xe - bến
 * @returns {Promise<Array>} Danh sách quan hệ
 */
export async function getBusStationRelations() {
  try {
    const response = await axiosClient.get('/bus-stations');
    
    if (response?.success && response?.data) {
      // Backend trả về: { success: true, data: [...] }
      if (Array.isArray(response.data)) {
        return response.data.map(rel => ({
          station_id: rel.stationId,
          bus_id: rel.busId,
          station_name: rel.station?.name || '',
          bus_name: rel.bus?.name || '',
          license_plate: rel.bus?.licensePlate || rel.bus?.license_plate || '',
          company_name: rel.bus?.companyName || 'Chưa có nhà xe',
          id: `${rel.stationId}-${rel.busId}`, // Composite key for table
        }));
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching bus-station relations:', error);
    return [];
  }
}

/**
 * Thêm xe vào bến
 * @param {Object} relationData - { station_id, bus_id }
 * @returns {Promise<Object>} Response từ server
 */
export async function addBusStationRelation(relationData) {
  try {
    const payload = {
      busId: Number(relationData.bus_id),
    };
    
    // Validate
    if (!relationData.station_id || !relationData.bus_id) {
      throw new Error('Bến xe và xe không được để trống');
    }
    if (isNaN(payload.busId) || payload.busId <= 0) {
      throw new Error('ID xe không hợp lệ');
    }
    if (isNaN(Number(relationData.station_id)) || Number(relationData.station_id) <= 0) {
      throw new Error('ID bến xe không hợp lệ');
    }
    
    console.log('Adding bus to station:', relationData.station_id, payload);
    const response = await axiosClient.post(
      `/stations/${relationData.station_id}/buses`,
      payload
    );
    console.log('Bus added to station successfully:', response);
    return response;
  } catch (error) {
    console.error('Error adding bus to station:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

/**
 * Xóa xe khỏi bến
 * @param {Object} relationData - { station_id, bus_id } hoặc { id: "station_id-bus_id" }
 * @returns {Promise<Object>} Response từ server
 */
export async function deleteBusStationRelation(relationData) {
  try {
    let stationId, busId;
    
    // Handle both formats: { station_id, bus_id } or { id: "station_id-bus_id" }
    if (relationData.id && typeof relationData.id === 'string') {
      const [sid, bid] = relationData.id.split('-');
      stationId = Number(sid);
      busId = Number(bid);
    } else {
      stationId = Number(relationData.station_id);
      busId = Number(relationData.bus_id);
    }
    
    if (isNaN(stationId) || isNaN(busId)) {
      throw new Error('ID bến xe hoặc ID xe không hợp lệ');
    }
    
    console.log('Removing bus from station:', stationId, busId);
    const response = await axiosClient.delete(
      `/stations/${stationId}/buses/${busId}`
    );
    console.log('Bus removed from station successfully:', response);
    return response;
  } catch (error) {
    console.error('Error removing bus from station:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}
