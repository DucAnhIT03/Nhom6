import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra token trong localStorage khi component mount
    const token = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      console.log('Login response:', response);
      
      if (response && response.success && response.data) {
        const { accessToken, user: userData } = response.data;
        
        if (!accessToken || !userData) {
          throw new Error('Thiếu thông tin token hoặc user trong response');
        }
        
        // Lưu token và user vào localStorage
        localStorage.setItem('admin_token', accessToken);
        localStorage.setItem('admin_user', JSON.stringify(userData));
        
        setUser(userData);
        return { success: true };
      }
      
      throw new Error(response?.message || 'Invalid response format');
    } catch (error) {
      console.error('Login error:', error);
      let message = 'Đăng nhập thất bại';
      
      if (error.response) {
        // Server trả về lỗi
        message = error.response.data?.message || error.response.data?.error || message;
      } else if (error.message) {
        // Lỗi từ code
        message = error.message;
      }
      
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
  };

  const updateProfile = async (data) => {
    try {
      const response = await authService.updateProfile(data);
      
      if (response && response.success && response.data) {
        const updatedUser = { ...user, ...response.data };
        localStorage.setItem('admin_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return updatedUser;
      }
      
      throw new Error(response?.message || 'Cập nhật thông tin thất bại');
    } catch (error) {
      console.error('Update profile error:', error);
      const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật thông tin';
      throw new Error(message);
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await authService.getProfile();
      
      if (response && response.success && response.data) {
        const updatedUser = response.data;
        localStorage.setItem('admin_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return updatedUser;
      }
      
      return null;
    } catch (error) {
      console.error('Refresh profile error:', error);
      // Don't throw error, just return null
      return null;
    }
  };

  const value = {
    user,
    login,
    logout,
    updateProfile,
    refreshProfile,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

