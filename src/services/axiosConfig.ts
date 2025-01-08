import axios, { AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';
import { getToken, setToken, removeToken } from './authService';

// Configurar la URL base según el entorno
const isProduction = window.location.hostname !== 'localhost';
axios.defaults.baseURL = isProduction 
  ? `${window.location.origin}/api`
  : 'http://localhost:3001/api';

// Configuración adicional
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor de solicitudes
axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuestas
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios; 