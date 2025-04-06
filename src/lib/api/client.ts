import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { logError } from '@/lib/utils/error-handler';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create a custom axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add a request interceptor to add the auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage in client-side environments only
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Add a timestamp to prevent caching for GET requests
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    return config;
  },
  (error) => {
    logError(error, 'API Request');
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors and other common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle network errors
    if (!error.response) {
      logError(error, 'Network Error');
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your internet connection.'
      });
    }

    // Handle authentication errors
    if (error.response.status === 401) {
      // Only redirect to login in client-side environments
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Use a small timeout to allow the current code to complete
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 100);
      }
    }

    // Handle rate limiting
    if (error.response.status === 429) {
      logError(error, 'Rate Limit');
    }

    // Handle server errors
    if (error.response.status >= 500) {
      logError(error, 'Server Error');
    }

    return Promise.reject(error);
  }
);

// Helper function to handle API requests with better error handling
export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    logError(error, `API ${config.method?.toUpperCase() || 'REQUEST'} ${config.url}`);
    throw error;
  }
};

export default apiClient;
