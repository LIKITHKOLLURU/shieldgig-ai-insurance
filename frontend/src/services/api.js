import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getDashboard: () => api.get('/users/dashboard'),
  getSubscriptions: () => api.get('/users/subscriptions'),
  getClaims: () => api.get('/users/claims'),
};

// Plans API
export const plansAPI = {
  getPlans: () => api.get('/plans'),
  subscribe: (planId) => api.post('/plans/subscribe', { planId }),
  getCurrentSubscription: () => api.get('/plans/current'),
  cancelSubscription: () => api.post('/plans/cancel'),
};

// Claims API
export const claimsAPI = {
  getClaims: () => api.get('/claims'),
  getClaim: (id) => api.get(`/claims/${id}`),
  createClaim: (claimData) => api.post('/claims', claimData),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getClaims: (params) => api.get('/admin/claims', { params }),
  updateClaim: (id, data) => api.put(`/admin/claims/${id}`, data),
  getFraudAlerts: () => api.get('/admin/fraud-alerts'),
};

export default api;
