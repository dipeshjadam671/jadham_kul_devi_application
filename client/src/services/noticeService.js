import apiClient from './api';

/**
 * Notice & Event API Service - Phase 4
 */

// --- Public Endpoints ---
export const getPublicNotices = async (params = {}) => {
  const response = await apiClient.get('/v1/public/content/notices', { params });
  return response.data;
};

export const getPublicNoticeBySlug = async (slug) => {
  const response = await apiClient.get(`/v1/public/content/notices/${slug}`);
  return response.data;
};

// --- Admin / Committee Endpoints ---
export const getAdminNotices = async (params = {}) => {
  const response = await apiClient.get('/v1/notices', { params });
  return response.data;
};

export const getNoticeById = async (id) => {
  const response = await apiClient.get(`/v1/notices/${id}`);
  return response.data;
};

export const createNotice = async (data) => {
  const response = await apiClient.post('/v1/notices', data);
  return response.data;
};

export const updateNotice = async (id, data) => {
  const response = await apiClient.put(`/v1/notices/${id}`, data);
  return response.data;
};

export const publishNotice = async (id) => {
  const response = await apiClient.patch(`/v1/notices/${id}/publish`);
  return response.data;
};

export const archiveNotice = async (id) => {
  const response = await apiClient.patch(`/v1/notices/${id}/archive`);
  return response.data;
};

export const togglePinNotice = async (id) => {
  const response = await apiClient.patch(`/v1/notices/${id}/pin`);
  return response.data;
};

export const deleteNotice = async (id) => {
  const response = await apiClient.delete(`/v1/notices/${id}`);
  return response.data;
};
