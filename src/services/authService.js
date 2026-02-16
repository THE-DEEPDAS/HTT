import api from './api';

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    // simplejwt returns { access, refresh, user }
    if (response.data.access) {
      localStorage.setItem('authToken', response.data.access);
    }
    if (response.data.refresh) {
      localStorage.setItem('refreshToken', response.data.refresh);
    }
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login/', { email, password });
    if (response.data.access) {
      localStorage.setItem('authToken', response.data.access);
    }
    if (response.data.refresh) {
      localStorage.setItem('refreshToken', response.data.refresh);
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/user/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.patch('/auth/user/', userData);
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  // Admin login
  adminLogin: async (email, password) => {
    const response = await api.post('/auth/admin-login/', { email, password });
    if (response.data.access) {
      localStorage.setItem('adminToken', response.data.access);
    }
    if (response.data.refresh) {
      localStorage.setItem('adminRefreshToken', response.data.refresh);
    }
    return response.data;
  },

  // Admin logout
  adminLogout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
  },

  // Check if admin is authenticated
  isAdminAuthenticated: () => {
    return !!localStorage.getItem('adminToken');
  },

  // Get admin token
  getAdminToken: () => {
    return localStorage.getItem('adminToken');
  },
};
