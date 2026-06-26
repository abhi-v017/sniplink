import axios from 'axios';
import { auth } from '../config/firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Inject Firebase ID token on every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// URL endpoints
export const urlApi = {
  create: (data) => api.post('/urls', data),
  getAll: () => api.get('/urls'),
  getAnalytics: (code) => api.get(`/urls/${code}/analytics`),
  delete: (code) => api.delete(`/urls/${code}`),
};

export default api;
