import axiosClient from './axiosClient';

export async function getUsers() {
  try {
    const response = await axiosClient.get('/admin/auth/users');
    if (response && response.success && response.data) {
      // Transform data to match frontend format
      return response.data.map(user => ({
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        phone: user.phone || '',
        status: user.status,
        created_at: user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '',
        updated_at: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('vi-VN') : '',
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function addUser(userData) {
  // Note: Admin không thể tạo user trực tiếp, phải qua đăng ký
  // Giữ lại function này để tương thích với code hiện tại
  throw new Error('Admin không thể tạo user trực tiếp. User phải đăng ký qua hệ thống.');
}

export async function updateUser(updatedUser) {
  // Note: Admin chỉ có thể update status, không update thông tin khác
  // Giữ lại function này để tương thích với code hiện tại
  throw new Error('Chức năng này chưa được hỗ trợ. Chỉ có thể khóa/mở khóa tài khoản.');
}

export async function deleteUser(id) {
  // Note: Admin không thể xóa user, chỉ có thể khóa
  throw new Error('Admin không thể xóa user. Vui lòng sử dụng chức năng khóa tài khoản.');
}

export async function blockUser(userId) {
  try {
    const response = await axiosClient.put(`/admin/auth/users/${userId}/status`, {
      status: 'BLOCKED'
    });
    return response;
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
}

export async function unblockUser(userId) {
  try {
    const response = await axiosClient.put(`/admin/auth/users/${userId}/status`, {
      status: 'ACTIVE'
    });
    return response;
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw error;
  }
}
