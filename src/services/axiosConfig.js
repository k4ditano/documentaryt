import axios from 'axios';
import { getToken, removeToken } from './authService';
// Configurar la URL base según el entorno
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
axios.defaults.baseURL = apiUrl.replace('/api/api', '/api');
// Configuración adicional
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.timeout = 30000; // 30 segundos de timeout
// Interceptor de solicitudes
axios.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Asegurarse de que la URL no tenga /api duplicado
    if (config.url?.startsWith('/api/')) {
        config.url = config.url.replace('/api/', '/');
    }
    return config;
}, (error) => {
    console.error('Error en la solicitud:', error);
    return Promise.reject(error);
});
// Interceptor de respuestas
axios.interceptors.response.use((response) => response, async (error) => {
    if (error.response?.status === 401) {
        // Token expirado o inválido
        removeToken();
        window.location.href = '/login';
    }
    else {
        console.error('Error en la respuesta:', error.message);
    }
    return Promise.reject(error);
});
export default axios;
