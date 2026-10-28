import apiClient from './api';

/**
 * Expense API Service - Phase 3
 */

export const getExpenses = async (params = {}) => {
  const response = await apiClient.get('/v1/expenses', { params });
  return response.data;
};

export const getExpenseById = async (id) => {
  const response = await apiClient.get(`/v1/expenses/${id}`);
  return response.data;
};

export const createExpense = async (data) => {
  const response = await apiClient.post('/v1/expenses', data);
  return response.data;
};

export const updateExpense = async (id, data) => {
  const response = await apiClient.put(`/v1/expenses/${id}`, data);
  return response.data;
};

export const archiveExpense = async (id) => {
  const response = await apiClient.patch(`/v1/expenses/${id}/archive`);
  return response.data;
};

export const getExpenseStats = async () => {
  const response = await apiClient.get('/v1/expenses/stats');
  return response.data;
};
