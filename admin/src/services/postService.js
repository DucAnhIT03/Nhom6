import axiosClient from './axiosClient';

const normalizePost = (post) => ({
  id: post.id,
  title: post.title,
  content: post.content,
  image_url: post.thumbnailUrl,
  slug: post.slug,
  status: post.status,
  created_at: post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('vi-VN')
    : '',
  updated_at: post.updatedAt
    ? new Date(post.updatedAt).toLocaleDateString('vi-VN')
    : '',
});

export async function getPosts(params = {}) {
  const response = await axiosClient.get('/posts', { params });
  if (response?.success && response?.data?.items) {
    return response.data.items.map(normalizePost);
  }
  if (Array.isArray(response?.data)) {
    return response.data.map(normalizePost);
  }
  return [];
}

export async function addPost(data) {
  const payload = {
    title: data.title,
    content: data.content,
    thumbnailUrl: data.image_url || undefined,
    status: data.status || 'PUBLISHED',
  };
  const response = await axiosClient.post('/posts', payload);
  return response;
}

export async function updatePost(data) {
  const payload = {
    title: data.title,
    content: data.content,
    thumbnailUrl: data.image_url || undefined,
    status: data.status || 'PUBLISHED',
  };
  const response = await axiosClient.put(`/posts/${data.id}`, payload);
  return response;
}

export async function deletePost(id) {
  return axiosClient.delete(`/posts/${id}`);
}

