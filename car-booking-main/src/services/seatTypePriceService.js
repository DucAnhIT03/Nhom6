import axiosClient from './axiosClient';

export const getSeatTypePrices = async (params = {}) => {
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
};



