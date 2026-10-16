import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { purgeApiCache } from './utils/cacheManager';

// Configure Axios Defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const isLoggingOutRef = useRef(false);

  // Setup Axios Authorization header interceptor
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [token]);

  // Setup Axios 401 response interceptor: purge cache + logout + redirect
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && !isLoggingOutRef.current) {
          isLoggingOutRef.current = true;
          await purgeApiCache().catch(() => {});
          localStorage.removeItem('token');
          sessionStorage.removeItem('board-layout');
          setToken(null);
          setUser(null);
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Load user profile on mount if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await axios.get('/me');
          setUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user with token", error);
          handleLogout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post('/login', { email, password });
      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data || { message: 'Network connection error' };
    }
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await axios.post('/logout');
      } catch (error) {
        console.error("Failed to revoke token on backend", error);
      }
    }
    await purgeApiCache().catch(() => {});
    sessionStorage.removeItem('board-layout');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => ({ ...prev, ...updatedUserData }));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login: handleLogin, logout: handleLogout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
