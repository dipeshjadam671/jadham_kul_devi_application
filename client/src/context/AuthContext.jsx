import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Backend MongoDB User Profile
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  /**
   * Fetch user profile using current active JWT token
   */
  const fetchUserProfile = useCallback(async (token) => {
    try {
      const response = await apiClient.get('/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.success && response.data.data?.user) {
        const profile = response.data.data.user;
        setCurrentUser(profile);
        setRole(profile.role || 'public');
        setPermissions(profile.permissions || []);
        return profile;
      }
    } catch (err) {
      console.warn('⚠️ Could not fetch backend user profile:', err.response?.data?.message || err.message);
      setCurrentUser(null);
      setRole(null);
      setPermissions([]);
    }
    return null;
  }, []);

  /**
   * Restore Authentication State upon page load
   */
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const token =
          localStorage.getItem('jadam_auth_token') ||
          localStorage.getItem('jadam_dev_token');

        if (token) {
          const profile = await fetchUserProfile(token);
          if (!profile && isMounted) {
            localStorage.removeItem('jadam_auth_token');
            localStorage.removeItem('jadam_dev_token');
          }
        }
      } catch (err) {
        console.error('Error restoring session:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [fetchUserProfile]);

  /**
   * Static Admin Login
   * Authenticates with static User ID and Password against backend
   */
  const login = async (username, password) => {
    setAuthError(null);
    setLoading(true);

    try {
      const response = await apiClient.post('/v1/auth/login', {
        username: username.trim(),
        password: password.trim(),
      });

      if (response.data && response.data.success && response.data.data?.token) {
        const { token, user } = response.data.data;
        localStorage.setItem('jadam_auth_token', token);
        setCurrentUser(user);
        setRole(user.role || 'admin');
        setPermissions(user.permissions || []);
        return user;
      } else {
        throw new Error(response.data?.message || 'लॉगिन विफल रहा (Login failed)');
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'अमान्य यूज़र आईडी या पासवर्ड (Invalid User ID or Password)';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user and clear local authentication credentials
   */
  const logout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jadam_auth_token');
        localStorage.removeItem('jadam_dev_token');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
      setRole(null);
      setPermissions([]);
      setAuthError(null);
    }
  };

  /**
   * Helper to retrieve active token
   */
  const getIdToken = async () => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('jadam_auth_token') ||
        localStorage.getItem('jadam_dev_token') ||
        null
      );
    }
    return null;
  };

  /**
   * Refresh current user profile
   */
  const refreshUserProfile = async () => {
    const token = await getIdToken();
    if (token) {
      return await fetchUserProfile(token);
    }
    return null;
  };

  /**
   * 1-Click Development Admin Quick Login
   */
  const devLogin = async (mockUsername = 'admin') => {
    return await login(mockUsername, 'admin123');
  };

  // Safe stubs for legacy phone auth calls if any
  const setupRecaptcha = () => null;
  const resetRecaptcha = () => {};
  const isFirebaseConfigured = () => true;
  const loginWithPhone = async () => {
    throw new Error('Phone OTP disabled. Please use User ID and Password.');
  };
  const verifyOTP = async () => {
    throw new Error('Phone OTP disabled. Please use User ID and Password.');
  };

  const value = {
    currentUser,
    firebaseUser: currentUser, // Compatible alias for components checking truthiness
    role,
    permissions,
    loading,
    isAuthenticated: Boolean(currentUser),
    authError,
    login,
    logout,
    getIdToken,
    refreshUserProfile,
    devLogin,
    setupRecaptcha,
    resetRecaptcha,
    isFirebaseConfigured,
    loginWithPhone,
    verifyOTP,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
