import axios from 'axios';

// Create a new Axios instance
const api = axios.create({
  // FIX: Use a relative URL. This tells the browser to make API calls
  // to the same domain the frontend is running on (e.g., eka.local).
baseURL: process.env.REACT_APP_API_URL,
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

// Interceptor to handle token refresh (optional but recommended)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/api/auth/token/refresh/', {
          refresh: refreshToken,
        });
        const { access } = response.data;
        localStorage.setItem('accessToken', access);
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);
        window.location.href = '/login'; // Redirect to login on failure
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;