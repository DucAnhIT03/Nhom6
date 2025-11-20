import axiosClient from './axiosClient';

/**
 * Upload ảnh lên server
 * @param {File} file - File ảnh cần upload
 * @param {string} folder - Thư mục lưu trữ (ví dụ: 'stations', 'buses', 'companies')
 * @returns {Promise<string>} URL của ảnh đã upload
 */
export const uploadImage = async (file, folder = 'uploads') => {
  try {
    if (!file) {
      throw new Error('Không có file để upload');
    }

    // Tạo FormData để gửi file
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    // Gửi request upload - endpoint là /upload/single
    const response = await axiosClient.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Backend trả về: { success: true, data: { url: '...', secureUrl: '...', ... } }
    if (response?.success && response?.data) {
      // Ưu tiên secureUrl, sau đó url
      if (response.data.secureUrl) {
        return response.data.secureUrl;
      }
      if (response.data.url) {
        return response.data.url;
      }
      // Nếu data là string trực tiếp
      if (typeof response.data === 'string') {
        return response.data;
      }
    }

    // Fallback
    if (typeof response === 'string') {
      return response;
    }

    throw new Error('Không thể lấy URL ảnh từ response');
  } catch (error) {
    console.error('Error uploading image:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Upload ảnh thất bại';
    throw new Error(errorMessage);
  }
};

/**
 * Upload nhiều ảnh cùng lúc
 * @param {File[]} files - Mảng các file ảnh
 * @param {string} folder - Thư mục lưu trữ
 * @returns {Promise<string[]>} Mảng các URL ảnh đã upload
 */
export const uploadMultipleImages = async (files, folder = 'uploads') => {
  try {
    if (!files || files.length === 0) {
      throw new Error('Không có file để upload');
    }

    // Tạo FormData để gửi nhiều file
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    if (folder) {
      formData.append('folder', folder);
    }

    // Gửi request upload - endpoint là /upload/multiple
    const response = await axiosClient.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Backend trả về: { success: true, data: [{ url: '...', secureUrl: '...' }, ...] }
    if (response?.success && Array.isArray(response?.data)) {
      return response.data.map(item => item.secureUrl || item.url || item);
    }

    throw new Error('Không thể lấy danh sách URL ảnh từ response');
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Upload nhiều ảnh thất bại';
    throw new Error(errorMessage);
  }
};


