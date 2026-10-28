import apiClient from './api';

/**
 * Puja API Service - Phase 6
 * Handles public summary, CRUD, year-wise analytics, and exports for Mata Ji Puja records.
 */

// --- Public Endpoints ---

export const getPublicPujaSummary = async (year) => {
  const response = await apiClient.get('/v1/public/puja/summary', {
    params: year ? { year } : {},
  });
  return response.data;
};

// --- Administrative Endpoints ---

export const getPujaRecords = async (params = {}) => {
  const response = await apiClient.get('/v1/puja/records', { params });
  return response.data;
};

export const getPujaRecordById = async (id) => {
  const response = await apiClient.get(`/v1/puja/records/${id}`);
  return response.data;
};

export const createPujaRecord = async (data) => {
  const response = await apiClient.post('/v1/puja/records', data);
  return response.data;
};

export const updatePujaRecord = async (id, data) => {
  const response = await apiClient.put(`/v1/puja/records/${id}`, data);
  return response.data;
};

export const archivePujaRecord = async (id) => {
  const response = await apiClient.patch(`/v1/puja/records/${id}/archive`);
  return response.data;
};

export const getPujaStats = async (year) => {
  const response = await apiClient.get('/v1/puja/records/stats', {
    params: year ? { year } : {},
  });
  return response.data;
};

export const getPujaDashboardSummary = getPujaStats;

export const getYearlyPujaSummary = async () => {
  const response = await apiClient.get('/v1/puja/yearly-summary');
  return response.data;
};

export const getMonthlyPujaSummary = async (year) => {
  const response = await apiClient.get('/v1/puja/monthly-summary', {
    params: year ? { year } : {},
  });
  return response.data;
};

export const exportPujaCsv = async (params = {}) => {
  const response = await apiClient.get('/v1/puja/export', {
    params,
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `puja-records-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
