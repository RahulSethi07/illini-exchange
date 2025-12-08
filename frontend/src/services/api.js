import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.response?.data?.error || error.message
      });
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Optionally redirect to login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    
    // Don't redirect on 403 for login/register pages
    if (error.response?.status === 403 && 
        (window.location.pathname === '/login' || window.location.pathname === '/register')) {
      // Let the component handle the error
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// API functions
export const listingsAPI = {
  getAll: (params) => api.get('/listings', { params }),
  getOne: (id) => api.get(`/listings/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'images' && Array.isArray(data[key])) {
        data[key].forEach(image => formData.append('images', image));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/listings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, data) => api.put(`/listings/${id}`, data),
  delete: (id) => api.delete(`/listings/${id}`),
  getCategories: () => api.get('/listings/meta/categories')
};

export const exchangePointsAPI = {
  getAll: () => api.get('/exchange-points'),
  getOne: (id) => api.get(`/exchange-points/${id}`),
  getGrouped: () => api.get('/exchange-points/grouped/zones')
};

export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getMyListings: (status) => api.get('/users/listings', { params: { status } }),
  getPublicProfile: (id) => api.get(`/users/${id}`)
};

export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  check: (listingId) => api.get(`/favorites/check/${listingId}`),
  add: (listingId) => api.post(`/favorites/${listingId}`),
  remove: (listingId) => api.delete(`/favorites/${listingId}`)
};

// Helper function to get the backend base URL (without /api)
export const getBackendBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  
  // If it's a full URL (production), remove /api to get base URL
  if (apiUrl.startsWith('http')) {
    return apiUrl.replace('/api', '');
  }
  
  // In development, use current origin (localhost:5001)
  return window.location.origin.replace(':3000', ':5001');
};

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it starts with /, prepend backend base URL
  if (imagePath.startsWith('/')) {
    return `${getBackendBaseUrl()}${imagePath}`;
  }
  
  // Otherwise return as is
  return imagePath;
};

export default api;

