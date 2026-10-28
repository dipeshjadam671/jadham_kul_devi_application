import apiClient from './api';

/**
 * Yatra Payment API Service - Phase 5
 * Manages ledger entries and installment transactions for Yatra registrations.
 */

export const createYatraPayment = async (paymentData) => {
  const response = await apiClient.post('/v1/yatra/payments', paymentData);
  return response.data;
};

export const getYatraPayments = async (params = {}) => {
  const response = await apiClient.get('/v1/yatra/payments', { params });
  return response.data;
};

export const getYatraPaymentById = async (id) => {
  const response = await apiClient.get(`/v1/yatra/payments/${id}`);
  return response.data;
};

export const updateYatraPayment = async (id, data) => {
  const response = await apiClient.put(`/v1/yatra/payments/${id}`, data);
  return response.data;
};
