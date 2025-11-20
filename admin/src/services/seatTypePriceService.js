import axiosClient from './axiosClient';

export async function getSeatTypePrices(params = {}) {
  try {
    const response = await axiosClient.get('/seat-type-prices', { params });
    if (response?.success && Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response)) {
      return response;
    }
    return [];
  } catch (error) {
    console.error('Error fetching seat type prices:', error);
    return [];
  }
}

export async function saveSeatTypePrices(payload) {
  try {
    const response = await axiosClient.post('/seat-type-prices', payload);
    return response;
  } catch (error) {
    console.error('Error saving seat type prices:', error);
    throw error;
  }
}

export async function bulkApplySeatTypePrices(payload) {
  try {
    const response = await axiosClient.post(
      '/seat-type-prices/bulk-apply',
      payload,
    );
    return response;
  } catch (error) {
    console.error('Error bulk applying seat type prices:', error);
    throw error;
  }
}


