import axios from 'axios';

// Create an Axios instance with base configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api',
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach tokens if needed
api.interceptors.request.use(
  async (config) => {
    let token = null;

    // Try to get Clerk token if available in the browser
    if (typeof window !== 'undefined' && (window as any).Clerk?.session) {
      try {
        token = await (window as any).Clerk.session.getToken();
      } catch (err) {
        console.error('Error fetching Clerk token', err);
      }
    }

    // Fallback to local storage
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }

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
