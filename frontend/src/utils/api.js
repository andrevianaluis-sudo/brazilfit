import axios from 'axios';

// Determine API base URL
// In production (served from backend), use relative /api
// In development, use the VITE_API_URL environment variable
let baseURL = '/api';
if (import.meta.env.DEV && import.meta.env.VITE_API_URL) {
  baseURL = import.meta.env.VITE_API_URL;
}
console.log('API baseURL:', baseURL);

const api = axios.create({
  baseURL,
  timeout: 10000,
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('brazilfit_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('brazilfit_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
