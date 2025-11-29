import axiosClient from './axiosClient';

const normalizeBanner = (banner) => ({
  id: banner.id,
  bannerUrl: banner.bannerUrl,
  position: banner.position,
  createdAt: banner.createdAt,
  updatedAt: banner.updatedAt,
});

/**
 * Lấy danh sách banner theo vị trí
 * @param {object} params - { position?: string, limit?: number, page?: number }
 */
export async function getBanners(params = {}) {
  const response = await axiosClient.get('/banners', { params });

  if (response?.success && response?.data?.items) {
    return response.data.items.map(normalizeBanner);
  }

  if (Array.isArray(response?.data)) {
    return response.data.map(normalizeBanner);
  }

  return [];
}

export async function getHeroBanners(limit = 1, position = 'HOME_TOP') {
  const response = await axiosClient.get('/hero-images', {
    params: { limit, position },
  });

  if (response?.success && response?.data?.items) {
    return response.data.items.map(normalizeBanner);
  }

  if (Array.isArray(response?.data)) {
    return response.data.map(normalizeBanner);
  }

  return [];
}

