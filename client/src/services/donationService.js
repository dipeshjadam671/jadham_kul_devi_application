import apiClient from './api';

/**
 * Donation API Service - Phase 3
 */

export const getDonations = async (params = {}) => {
  const response = await apiClient.get('/v1/donations', { params });
  return response.data;
};

export const getDonationById = async (id) => {
  const response = await apiClient.get(`/v1/donations/${id}`);
  return response.data;
};

export const createDonation = async (data) => {
  const response = await apiClient.post('/v1/donations', data);
  return response.data;
};

export const updateDonation = async (id, data) => {
  const response = await apiClient.put(`/v1/donations/${id}`, data);
  return response.data;
};

export const verifyDonation = async (id) => {
  const response = await apiClient.patch(`/v1/donations/${id}/verify`);
  return response.data;
};

export const rejectDonation = async (id, reason) => {
  const response = await apiClient.patch(`/v1/donations/${id}/reject`, { reason });
  return response.data;
};

export const archiveDonation = async (id) => {
  const response = await apiClient.patch(`/v1/donations/${id}/archive`);
  return response.data;
};

export const getDonationStats = async () => {
  const response = await apiClient.get('/v1/donations/stats');
  return response.data;
};
