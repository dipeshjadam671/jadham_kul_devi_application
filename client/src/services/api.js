import axios from 'axios';

/**
 * Base API Service configured with Vite environment variables
 * Default base URL falls back to /api or localhost:5000/api
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Request Interceptor - JWT Token Injection
 * Automatically injects the active admin JWT token as Bearer token in the Authorization header.
 */
apiClient.interceptors.request.use(
  (config) => {
    try {
      if (typeof window !== 'undefined') {
        const token =
          localStorage.getItem('jadam_auth_token') ||
          localStorage.getItem('jadam_dev_token');

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (tokenError) {
      console.warn('⚠️ Could not attach Auth token to request:', tokenError.message);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Standardized Error Handling
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // 401 Unauthorized handling
      if (error.response.status === 401) {
        console.warn('⚠️ Unauthorized API access (401). Check authentication credentials.');
      }
    } else if (error.request) {
      console.error('Network Error: Server is not reachable. Check backend status.');
    }
    return Promise.reject(error);
  }
);

/**
 * Health Check API Call
 */
export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: 'Failed to communicate with backend server',
    };
  }
};

/**
 * Auth API Call: Fetch currently authenticated user's MongoDB profile
 */
export const fetchCurrentUserProfile = async () => {
  const response = await apiClient.get('/v1/auth/me');
  return response.data;
};

/**
 * Test API Endpoints - Phase 2 Verification
 */
export const testAuthEndpoints = {
  public: async () => (await apiClient.get('/v1/test/public')).data,
  authenticated: async () => (await apiClient.get('/v1/test/authenticated')).data,
  committee: async () => (await apiClient.get('/v1/test/committee')).data,
  admin: async () => (await apiClient.get('/v1/test/admin')).data,
};

export default apiClient;
