import axios from 'axios';

// Create an Axios instance with base configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api',
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach tokens if needed (Clerk handles its own tokens, but if we use JWT from backend)
api.interceptors.request.use(
  (config) => {
    // You can attach tokens here if bypassing Clerk and using custom JWT
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle 401 Unauthorized, etc.
    if (error.response?.status === 401) {
      // Trigger logout or token refresh
    }
    return Promise.reject(error.response?.data || error.message);
  }
);
