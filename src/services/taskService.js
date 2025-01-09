import axios from 'axios';
import { getToken } from './authService';
const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = `${BASE_URL}/tasks`;
// Configurar axios para incluir credenciales y token
axios.defaults.withCredentials = true;
// Interceptor para agregar el token a todas las solicitudes
axios.interceptors.request.use(config => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    console.error('Error en la solicitud:', error);
    return Promise.reject(error);
});
export const taskService = {
    // Obtener todas las tareas
    getAllTasks: async () => {
        try {
            console.log('Solicitando todas las tareas a:', API_URL);
            const response = await axios.get(API_URL);
            console.log('Respuesta getAllTasks:', response.data);
            return Array.isArray(response.data) ? response.data : [];
        }
        catch (error) {
            console.error('Error al obtener las tareas:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                // Token expirado o inválido
                window.location.href = '/login';
            }
            return [];
        }
    },
    // Crear una nueva tarea
    createTask: async (task) => {
        try {
            const response = await axios.post(API_URL, task);
            return response.data;
        }
        catch (error) {
            console.error('Error al crear la tarea:', error);
            throw error;
        }
    },
    // Actualizar una tarea existente
    updateTask: async (id, taskData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, taskData);
            return response.data;
        }
        catch (error) {
            console.error('Error al actualizar la tarea:', error);
            throw error;
        }
    },
    // Eliminar una tarea
    deleteTask: async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
        }
        catch (error) {
            console.error('Error al eliminar la tarea:', error);
            throw error;
        }
    },
    // Obtener tareas por rango de fechas
    getTasksByDateRange: async (start, end) => {
        try {
            const response = await axios.get(`${API_URL}/calendar/${start}/${end}`);
            return Array.isArray(response.data) ? response.data : [];
        }
        catch (error) {
            console.error('Error al obtener las tareas por rango de fechas:', error);
            return [];
        }
    }
};
