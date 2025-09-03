import axios from 'axios';

// Create a new Axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // e.g., "https://eka-backend-bohx.onrender.com"
});

// Use an interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // IMPROVEMENT #2: Check for error.response to prevent crashes on network errors
    // IMPROVEMENT #1: Add checks to prevent refresh loops on login/refresh failures
    if (error.response && error.response.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/token/refresh/') {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        // THE MAIN FIX: Use the full, absolute URL for the refresh request
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/auth/token/refresh/`, 
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem('accessToken', access);
        
        // Update the header for the original request and any future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        
        return api(originalRequest);

      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
