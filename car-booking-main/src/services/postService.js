import axiosClient from './axiosClient';

export const getPosts = async (params = {}) => {
  const response = await axiosClient.get('/posts', { params });
  return response;
};

export const getPost = async (idOrSlug) => {
  if (!idOrSlug) {
    throw new Error('idOrSlug is required to fetch a post');
  }
  const response = await axiosClient.get(`/posts/${idOrSlug}`);
  return response;
};



