import apiClient from './api';

/**
 * Income API Service - Phase 3
 */

export const getIncome = async (params = {}) => {
  const response = await apiClient.get('/v1/income', { params });
  return response.data;
};

export const getIncomeById = async (id) => {
  const response = await apiClient.get(`/v1/income/${id}`);
  return response.data;
};

export const createIncome = async (data) => {
  const response = await apiClient.post('/v1/income', data);
  return response.data;
};

export const updateIncome = async (id, data) => {
  const response = await apiClient.put(`/v1/income/${id}`, data);
  return response.data;
};

export const archiveIncome = async (id) => {
  const response = await apiClient.patch(`/v1/income/${id}/archive`);
  return response.data;
};

export const getIncomeStats = async () => {
  const response = await apiClient.get('/v1/income/stats');
  return response.data;
};
