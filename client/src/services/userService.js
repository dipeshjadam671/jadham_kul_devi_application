import apiClient from './api';

/**
 * User & Committee API Service - Phase 6
 * Admin management of users, committee members, and permission matrices.
 */

export const getUsers = async (params = {}) => {
  const response = await apiClient.get('/v1/users', { params });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await apiClient.get(`/v1/users/${id}`);
  return response.data;
};

export const createCommitteeMember = async (data) => {
  const response = await apiClient.post('/v1/users/committee', data);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await apiClient.put(`/v1/users/${id}`, data);
  return response.data;
};

export const activateUser = async (id) => {
  const response = await apiClient.patch(`/v1/users/${id}/activate`);
  return response.data;
};

export const deactivateUser = async (id) => {
  const response = await apiClient.patch(`/v1/users/${id}/deactivate`);
  return response.data;
};

export const updateUserPermissions = async (id, permissions) => {
  const response = await apiClient.patch(`/v1/users/${id}/permissions`, { permissions });
  return response.data;
};

export const getCommitteeMembers = async () => {
  const response = await apiClient.get('/v1/users/committee/list');
  return response.data;
};

export const getUserCounts = async () => {
  const response = await apiClient.get('/v1/users/summary/counts');
  return response.data;
};
