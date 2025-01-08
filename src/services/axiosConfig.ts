import axios from 'axios';
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
    // Si la respuesta incluye un token en el header, actualizarlo
    const newToken = response.headers['x-auth-token'];
    if (newToken) {
      setToken(newToken);
    }
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
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Para otras rutas, intentamos obtener el usuario actual
      try {
        const response = await axios.get('/auth/me');
        if (response.data) {
          // Si obtenemos el usuario, reintentamos la petición original
          return axios(originalRequest);
        } else {
          // Si no hay usuario, eliminamos el token y redirigimos
          removeToken();
          window.location.href = '/login';
        }
      } catch (refreshError) {
        // Si falla la verificación, eliminamos el token y redirigimos
        removeToken();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axios; 