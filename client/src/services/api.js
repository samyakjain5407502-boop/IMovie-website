import axios from 'axios';

// In development, Vite proxies '/api' to 'http://localhost:5000/api'
const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to every request if available
API.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('imovies_user');
    if (userInfo) {
      try {
        const { token } = JSON.parse(userInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Error parsing stored user info', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global errors (like 401 unauthorized)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      // localStorage.removeItem('imovies_user');
    }
    return Promise.reject(error);
  }
);

export default API;

