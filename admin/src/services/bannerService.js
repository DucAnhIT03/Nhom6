import axiosClient from './axiosClient';

const normalizeBanner = (banner) => ({
  id: banner.id,
  banner_url: banner.bannerUrl,
  position: banner.position,
  created_at: banner.createdAt
    ? new Date(banner.createdAt).toLocaleDateString('vi-VN')
    : '',
  updated_at: banner.updatedAt
    ? new Date(banner.updatedAt).toLocaleDateString('vi-VN')
    : '',
});

export async function getBanners(params = {}) {
  // params có thể gồm: page, limit, position,...
  const response = await axiosClient.get('/banners', { params });

  // API backend chuẩn: { success, data: { items, total, ... } }
  if (response?.success && response?.data?.items) {
    return {
      items: response.data.items.map(normalizeBanner),
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit,
      totalPages: response.data.totalPages,
    };
  }

  // Fallback nếu backend trả mảng đơn giản
  if (Array.isArray(response?.data)) {
    return {
      items: response.data.map(normalizeBanner),
      total: response.data.length,
      page: 1,
      limit: response.data.length,
      totalPages: 1,
    };
  }

  return {
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };
}

export async function addBanner(data) {
  // data: { banner_url, position? }
  const payload = {
    bannerUrl: data.banner_url,
    position: data.position || 'HOME_TOP',
  };
  const response = await axiosClient.post('/banners', payload);
  return response;
}

export async function updateBanner(data) {
  // data: { id, banner_url, position? }
  const payload = {
    bannerUrl: data.banner_url,
    position: data.position || 'HOME_TOP',
  };
  const response = await axiosClient.put(`/banners/${data.id}`, payload);
  return response;
}

export async function deleteBanner(id) {
  return axiosClient.delete(`/banners/${id}`);
}


