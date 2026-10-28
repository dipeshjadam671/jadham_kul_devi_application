import apiClient from './api';

/**
 * Gallery API Service - Phase 4
 */

// --- Public Endpoints ---
export const getPublicAlbums = async (params = {}) => {
  const response = await apiClient.get('/v1/public/content/albums', { params });
  return response.data;
};

export const getPublicAlbumBySlug = async (slug, params = {}) => {
  const response = await apiClient.get(`/v1/public/content/albums/${slug}`, { params });
  return response.data;
};

export const getPublicMedia = async (params = {}) => {
  const response = await apiClient.get('/v1/public/content/media', { params });
  return response.data;
};

// --- Admin / Committee Album Endpoints ---
export const getAdminAlbums = async (params = {}) => {
  const response = await apiClient.get('/v1/gallery/albums', { params });
  return response.data;
};

export const getAlbumById = async (id) => {
  const response = await apiClient.get(`/v1/gallery/albums/${id}`);
  return response.data;
};

export const createAlbum = async (data) => {
  const response = await apiClient.post('/v1/gallery/albums', data);
  return response.data;
};

export const updateAlbum = async (id, data) => {
  const response = await apiClient.put(`/v1/gallery/albums/${id}`, data);
  return response.data;
};

export const deleteAlbum = async (id) => {
  const response = await apiClient.delete(`/v1/gallery/albums/${id}`);
  return response.data;
};

// --- Admin Media Endpoints ---
export const getAlbumMedia = async (albumId, params = {}) => {
  const response = await apiClient.get(`/v1/gallery/albums/${albumId}/media`, { params });
  return response.data;
};

export const createMedia = async (data) => {
  const response = await apiClient.post('/v1/gallery/media', data);
  return response.data;
};

export const updateMedia = async (id, data) => {
  const response = await apiClient.put(`/v1/gallery/media/${id}`, data);
  return response.data;
};

export const deleteMedia = async (id) => {
  const response = await apiClient.delete(`/v1/gallery/media/${id}`);
  return response.data;
};

export const reorderMedia = async (albumId, mediaOrders) => {
  const response = await apiClient.patch(`/v1/gallery/albums/${albumId}/media/reorder`, { mediaOrders });
  return response.data;
};

// --- File Upload Endpoint ---
export const uploadFile = async (file, folder = 'gallery') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await apiClient.post('/v1/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
