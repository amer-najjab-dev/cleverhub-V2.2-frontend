import axios from 'axios';

// URL hardcodeada del backend de producción
const BACKEND_URL = 'https://cleverhub-v22-backend-production.up.railway.app';
// Sin /api al final

export const API_URL = BACKEND_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  const region = localStorage.getItem('cleverhub_region') || 'MA';
  config.headers['X-Region'] = region;
  console.log(`📤 Petición a ${config.url} con región: ${region}`);
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
