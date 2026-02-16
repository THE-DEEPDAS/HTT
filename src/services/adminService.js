import axios from 'axios';

const API_BASE_URL = 'https://thedeepdas-htt.hf.space/api';

// Separate axios instance for admin calls (uses adminToken)
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRefreshToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const adminService = {
  getAnalytics: async () => {
    const response = await adminApi.get('/admin/analytics/');
    return response.data;
  },

  getChats: async () => {
    const response = await adminApi.get('/admin/chats/');
    return response.data;
  },

  getChatSession: async (sessionId) => {
    const response = await adminApi.get('/admin/chats/', {
      params: { session_id: sessionId },
    });
    return response.data;
  },
};
