import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(
      error instanceof Error ? error : new Error(String(error)),
    );
  },
);

// Handle responses and extract error messages
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const axiosError = error as {
      response?: {
        status?: number;
        data?: { message?: string | string[] };
      };
      config?: { url?: string };
    };

    // Don't redirect on auth endpoints (signin/signup)
    const isAuthEndpoint = axiosError.config?.url?.includes('/auth/sign');

    if (axiosError.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }

    // Extract error message from API response
    const responseMessage = axiosError.response?.data?.message;
    let errorMessage = 'An error occurred';

    if (Array.isArray(responseMessage)) {
      errorMessage = responseMessage.join(', ');
    } else if (typeof responseMessage === 'string') {
      errorMessage = responseMessage;
    }

    return Promise.reject(new Error(errorMessage));
  },
);

export default api;
