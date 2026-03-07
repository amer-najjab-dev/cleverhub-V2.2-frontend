import axios from 'axios';

const getBaseUrl = (): string => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5001/api';
  }
  if (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) {
    return process.env.VITE_API_URL;
  }
  return 'http://localhost:5001/api';
};

export const API_URL = getBaseUrl();

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// INTERCEPTOR PARA AÑADIR LA REGIÓN A TODAS LAS PETICIONES
api.interceptors.request.use((config) => {
  // Obtener región del localStorage (establecida por RegionSelector)
  const region = localStorage.getItem('cleverhub_region') || 'MA';
  
  // Añadir header X-Region
  config.headers['X-Region'] = region;
  
  // Log para debugging (opcional, quitar en producción)
  console.log(`📤 Petición a ${config.url} con región: ${region}`);
  
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);