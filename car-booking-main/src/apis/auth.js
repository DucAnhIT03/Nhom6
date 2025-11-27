import axiosClient from '../services/axiosClient';

export const authApi = {

  registerUser: (data) => {
    return axiosClient.post('/user/auth/register', data);
  },

  verifyOtpAndRegisterUser: (data) => {
    return axiosClient.post('/user/auth/verify-otp', data);
  },

  loginUser: (data) => {
    return axiosClient.post('/user/auth/login', data);
  },

  resendOtpUser: (email) => {
    return axiosClient.post('/user/auth/resend-otp', { email });
  },

  getUserProfile: () => {
    return axiosClient.get('/user/auth/profile');
  },

  updateUserProfile: (data) => {
    return axiosClient.put('/user/auth/profile', data);
  },

  changePassword: (data) => {
    return axiosClient.put('/user/auth/change-password', data);
  },


  registerAdmin: (data) => {
    return axiosClient.post('/admin/auth/register', data);
  },

  verifyOtpAndRegisterAdmin: (data) => {
    return axiosClient.post('/admin/auth/verify-otp', data);
  },

  loginAdmin: (data) => {
    return axiosClient.post('/admin/auth/login', data);
  },

  resendOtpAdmin: (email) => {
    return axiosClient.post('/admin/auth/resend-otp', { email });
  },

  getAdminProfile: () => {
    return axiosClient.get('/admin/auth/profile');
  },
};

