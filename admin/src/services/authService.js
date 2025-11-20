import axiosClient from './axiosClient';

export const authService = {
  login: async (data) => {
    const response = await axiosClient.post('/admin/auth/login', data);
    return response;
  },

  getProfile: async () => {
    const response = await axiosClient.get('/admin/auth/profile');
    return response;
  },

  updateProfile: async (data) => {
    const response = await axiosClient.put('/admin/auth/profile', data);
    return response;
  },
};

