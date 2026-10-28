import apiClient from './api';

/**
 * Restricted Person API Service - Phase 6
 * Strictly protected endpoints for confidential administrative restricted records.
 */

export const getRestrictedPersons = async (params = {}) => {
  const response = await apiClient.get('/v1/restricted-persons', { params });
  return response.data;
};

export const getRestrictedPersonById = async (id) => {
  const response = await apiClient.get(`/v1/restricted-persons/${id}`);
  return response.data;
};

export const createRestrictedPerson = async (data) => {
  const response = await apiClient.post('/v1/restricted-persons', data);
  return response.data;
};

export const updateRestrictedPerson = async (id, data) => {
  const response = await apiClient.put(`/v1/restricted-persons/${id}`, data);
  return response.data;
};

export const revokeRestriction = async (id, revocationReason) => {
  const response = await apiClient.patch(`/v1/restricted-persons/${id}/revoke`, {
    revocationReason,
  });
  return response.data;
};

export const archiveRestrictedPerson = async (id) => {
  const response = await apiClient.patch(`/v1/restricted-persons/${id}/archive`);
  return response.data;
};

export const getRestrictedCounts = async () => {
  const response = await apiClient.get('/v1/restricted-persons/counts');
  return response.data;
};

export const exportRestrictedCsv = async (params = {}) => {
  const response = await apiClient.get('/v1/restricted-persons/export', {
    params,
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `restricted-records-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
