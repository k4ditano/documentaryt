import axios from 'axios';

// Configuración global de axios
axios.defaults.baseURL = '/api';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor para manejar tokens
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar token si la sesión ha expirado
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default axios; 