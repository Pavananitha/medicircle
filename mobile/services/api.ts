import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { Storage } from '../utils/storage';

/**
 * Resolves the backend base URL for development:
 * 1. Prioritizes EXPO_PUBLIC_API_URL from environment variables (.env)
 * 2. Android emulator routes 10.0.2.2 to host computer loopback
 * 3. iOS simulator and Web default to http://localhost:5000/api
 * Note: For physical mobile devices, EXPO_PUBLIC_API_URL must be configured with your LAN IP
 * (e.g., http://192.168.1.100:5000/api).
 */
export const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return 'https://medicircle-backend.onrender.com/api';
};

export const API_BASE_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedCallback = (cb: () => void) => {
  onUnauthorizedCallback = cb;
};

// Attach Authorization Bearer token from SecureStore to outgoing requests
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await Storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unified response error formatting
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; error?: any }>) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        await Storage.clearAuth();
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        }
      }

      const backendMessage =
        error.response.data?.message ||
        (typeof error.response.data?.error === 'string'
          ? error.response.data.error
          : null);

      if (backendMessage) {
        return Promise.reject(new Error(backendMessage));
      }

      switch (status) {
        case 400:
          return Promise.reject(new Error('Invalid request data. Please check your input.'));
        case 401:
          return Promise.reject(new Error('Invalid email or password.'));
        case 403:
          return Promise.reject(new Error('Access forbidden. You do not have permission for this action.'));
        case 404:
          return Promise.reject(new Error('Requested resource not found.'));
        case 500:
          return Promise.reject(new Error('MediCircle server encountered an internal error. Please try again later.'));
        default:
          return Promise.reject(new Error(`Server error (${status}). Please try again.`));
      }
    } else if (error.request) {
      // Backend unavailable or network offline
      return Promise.reject(
        new Error('Unable to connect to MediCircle server. Please check your network connection.')
      );
    }

    return Promise.reject(new Error('An unexpected error occurred. Please try again.'));
  }
);

export default apiClient;
