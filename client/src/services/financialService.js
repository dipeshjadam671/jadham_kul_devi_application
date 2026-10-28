import apiClient from './api';

/**
 * Financial Service - Phase 3
 * Handles administrative financial reports, analytics, CSV exports,
 * and public transparency queries.
 */

// --- Admin / Protected Endpoints ---

export const getFinancialSummary = async (params = {}) => {
  const response = await apiClient.get('/v1/financial/summary', { params });
  return response.data;
};

export const getMonthlySummary = async (year) => {
  const response = await apiClient.get('/v1/financial/monthly-summary', {
    params: { year },
  });
  return response.data;
};

export const getYearlySummary = async () => {
  const response = await apiClient.get('/v1/financial/yearly-summary');
  return response.data;
};

export const downloadFinancialCSV = async (type = 'donations', params = {}) => {
  const response = await apiClient.get('/v1/financial/export', {
    params: { type, ...params },
    responseType: 'blob',
  });

  // Create temporary URL to trigger file download in browser
  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `mandir_${type}_export_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

// --- Public Transparency Endpoints ---

export const getPublicFinancialSummary = async (params = {}) => {
  const response = await apiClient.get('/v1/public/financial/summary', { params });
  return response.data;
};

export const getPublicMonthlySummary = async (year) => {
  const response = await apiClient.get('/v1/public/financial/monthly-summary', {
    params: { year },
  });
  return response.data;
};

export const getPublicDonations = async (params = {}) => {
  const response = await apiClient.get('/v1/public/financial/donations', { params });
  return response.data;
};

export const getPublicIncome = async (params = {}) => {
  const response = await apiClient.get('/v1/public/financial/income', { params });
  return response.data;
};

export const getPublicExpenses = async (params = {}) => {
  const response = await apiClient.get('/v1/public/financial/expenses', { params });
  return response.data;
};
