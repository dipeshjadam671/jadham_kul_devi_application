import apiClient from './api';

/**
 * Yatra API Service - Phase 5
 * Handles public registrations, status lookups, information guidelines,
 * and comprehensive administrative operations for Ram Navami and Mansarovar yatras.
 */

// --- Public Endpoints ---

export const getPublicYatraInfo = async (yatraType) => {
  const response = await apiClient.get(`/v1/yatra/info/${yatraType}`);
  return response.data;
};

export const registerPublicYatra = async (registrationData) => {
  const response = await apiClient.post('/v1/public/yatra/register', registrationData);
  return response.data;
};

export const checkPublicRegistrationStatus = async (registrationNumber, mobile) => {
  const response = await apiClient.get('/v1/public/yatra/check', {
    params: {
      registrationNumber: registrationNumber?.trim(),
      mobile: mobile?.trim(),
    },
  });
  return response.data;
};

// --- Administrative Endpoints ---

export const getYatraRegistrations = async (params = {}) => {
  const response = await apiClient.get('/v1/yatra/registrations', { params });
  return response.data;
};

export const getYatraRegistrationById = async (id) => {
  const response = await apiClient.get(`/v1/yatra/registrations/${id}`);
  return response.data;
};

export const createAdminYatraRegistration = async (data) => {
  const response = await apiClient.post('/v1/yatra/registrations', data);
  return response.data;
};

export const updateYatraRegistration = async (id, data) => {
  const response = await apiClient.put(`/v1/yatra/registrations/${id}`, data);
  return response.data;
};

export const confirmYatraRegistration = async (id) => {
  const response = await apiClient.patch(`/v1/yatra/registrations/${id}/confirm`);
  return response.data;
};

export const cancelYatraRegistration = async (id, cancellationReason = '') => {
  const response = await apiClient.patch(`/v1/yatra/registrations/${id}/cancel`, { cancellationReason });
  return response.data;
};

export const completeYatraRegistration = async (id) => {
  const response = await apiClient.patch(`/v1/yatra/registrations/${id}/complete`);
  return response.data;
};

export const archiveYatraRegistration = async (id) => {
  const response = await apiClient.patch(`/v1/yatra/registrations/${id}/archive`);
  return response.data;
};

export const updateYatraInfo = async (yatraType, data) => {
  const response = await apiClient.put(`/v1/yatra/info/${yatraType}`, data);
  return response.data;
};

// --- Analytics & Reporting ---

export const getYatraStats = async (params = {}) => {
  const response = await apiClient.get('/v1/yatra/stats', { params });
  return response.data;
};

export const getYearlySummaryReport = async (year) => {
  const response = await apiClient.get('/v1/yatra/yearly-summary', { params: { year } });
  return response.data;
};

export const getMonthlySummaryReport = async (year) => {
  const response = await apiClient.get('/v1/yatra/monthly-summary', { params: { year } });
  return response.data;
};

export const exportYatraCsv = async (params = {}) => {
  const response = await apiClient.get('/v1/yatra/export', {
    params,
    responseType: 'blob',
  });
  return response.data;
};
