import axiosClient from './axiosClient';

export async function getDashboardStats() {
  try {
    const response = await axiosClient.get('/dashboard/stats');
    if (response && response.success && response.data) {
      return {
        totalUsers: response.data.totalUsers || 0,
        totalStations: response.data.totalStations || 0,
        totalCompanies: response.data.totalCompanies || 0,
        totalBuses: response.data.totalBuses || 0,
        totalRoutes: response.data.totalRoutes || 0,
        totalPosts: response.data.totalPosts || 0,
      };
    }
    return {
      totalUsers: 0,
      totalStations: 0,
      totalCompanies: 0,
      totalBuses: 0,
      totalRoutes: 0,
      totalPosts: 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalUsers: 0,
      totalStations: 0,
      totalCompanies: 0,
      totalBuses: 0,
      totalRoutes: 0,
      totalPosts: 0,
    };
  }
}


