import axios from 'axios';

const getBaseUrl = (): string => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  // Localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5001/api';
  }
  
  // Vercel (producción o preview)
  if (hostname.includes('vercel.app')) {
    return 'https://cleverhub-v2-backend-production.up.railway.app/api';
  }
  
  // Fallback
  return 'https://cleverhub-v2-backend-production.up.railway.app/api';
};

export const API_URL = getBaseUrl();
console.log("🔥 BASE URL AXIOS:", API_URL);

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