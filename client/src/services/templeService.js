import apiClient from './api';

/**
 * Temple Info & Rules API Service - Phase 4
 */

// --- Temple Info (Singleton) ---
export const getTempleInfo = async () => {
  const response = await apiClient.get('/v1/temple-info');
  return response.data;
};

export const updateTempleInfo = async (data) => {
  const response = await apiClient.put('/v1/temple-info', data);
  return response.data;
};

// --- Temple Rules (Max 15) ---
export const getTempleRules = async (params = {}) => {
  const response = await apiClient.get('/v1/temple-rules', { params });
  return response.data;
};

export const createTempleRule = async (data) => {
  const response = await apiClient.post('/v1/temple-rules', data);
  return response.data;
};

export const updateTempleRule = async (id, data) => {
  const response = await apiClient.put(`/v1/temple-rules/${id}`, data);
  return response.data;
};

export const deleteTempleRule = async (id) => {
  const response = await apiClient.delete(`/v1/temple-rules/${id}`);
  return response.data;
};

export const reorderTempleRules = async (ruleOrders) => {
  const response = await apiClient.patch('/v1/temple-rules/reorder', { rules: ruleOrders });
  return response.data;
};
