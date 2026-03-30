import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 120000, // 2 min timeout for AI calls
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('intervuai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally - redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('intervuai_token');
      localStorage.removeItem('intervuai_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
