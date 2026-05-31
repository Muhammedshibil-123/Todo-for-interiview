import axios from 'axios';
import { store } from '../redux/store';
import { setCredentials, logout } from '../redux/authSlice';

// Create base instance
const API = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true, // Crucial for HttpOnly cookies
});

// Request interceptor — attach token from Redux
API.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 & auto-refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't loop if the failing request WAS the refresh token attempt
      if (originalRequest.url === '/auth/token/refresh/') {
        store.dispatch(logout());
        return Promise.reject(error);
      }

      try {
        // Attempt to get a new token via HttpOnly cookie
        const res = await axios.post(
          'http://localhost:8000/api/auth/token/refresh/',
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.access;
        const user = res.data.user;

        // Update Redux state
        store.dispatch(setCredentials({ user, accessToken: newAccessToken }));

        // Retry the original failed request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        // Refresh failed (cookie expired or missing) -> logout
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
