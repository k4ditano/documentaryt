import axios from 'axios';
import { getToken, removeToken } from './authService';

// Configurar la URL base
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Interceptor de solicitudes
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
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
  (response) => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si es un error 401 y no es un reintento
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Si el error es en /auth/me, simplemente eliminamos el token
      if (originalRequest.url === '/auth/me') {
        removeToken();
        return Promise.reject(error);
      }

      // Para otras rutas, intentamos obtener el usuario actual
      try {
        const response = await axios.get('/auth/me');
        if (response.data) {
          // Si obtenemos el usuario, reintentamos la petición original
          return axios(originalRequest);
        } else {
          // Si no hay usuario, eliminamos el token
          removeToken();
        }
      } catch (refreshError) {
        // Si falla la verificación, eliminamos el token
        removeToken();
      }
    }

    return Promise.reject(error);
  }
);

export default axios; 