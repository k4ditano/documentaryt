import axios from 'axios';
import { getToken } from './authService';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date: string;
    created_at?: string;
    updated_at?: string;
    user_id?: number;
    linked_pages?: string[];
}

const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = `${BASE_URL}/tasks`;

// Configurar axios para incluir credenciales y token
axios.defaults.withCredentials = true;

// Interceptor para agregar el token a todas las solicitudes
axios.interceptors.request.use(
    config => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        console.error('Error en la solicitud:', error);
        return Promise.reject(error);
    }
);

export const taskService = {
    lastFetch: 0,
    cachedTasks: [] as Task[],
    cacheTimeout: 5000, // 5 segundos

    // Obtener todas las tareas
    getAllTasks: async (): Promise<Task[]> => {
        try {
            const now = Date.now();
            if (taskService.cachedTasks.length > 0 && now - taskService.lastFetch < taskService.cacheTimeout) {
                console.log('Retornando tareas desde caché');
                return taskService.cachedTasks;
            }

            console.log('Solicitando todas las tareas a:', API_URL);
            const response = await axios.get<Task[]>(API_URL);
            console.log('Respuesta getAllTasks:', response.data);
            
            taskService.lastFetch = now;
            taskService.cachedTasks = Array.isArray(response.data) ? response.data : [];
            return taskService.cachedTasks;
        } catch (error) {
            console.error('Error al obtener las tareas:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                // Token expirado o inválido
                window.location.href = '/login';
            }
            return taskService.cachedTasks;
        }
    },

    // Crear una nueva tarea
    createTask: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Task> => {
        try {
            const response = await axios.post<Task>(API_URL, task);
            return response.data;
        } catch (error) {
            console.error('Error al crear la tarea:', error);
            throw error;
        }
    },

    // Actualizar una tarea existente
    updateTask: async (id: number, taskData: Partial<Task>): Promise<Task> => {
        try {
            const response = await axios.put<Task>(`${API_URL}/${id}`, taskData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar la tarea:', error);
            throw error;
        }
    },

    // Eliminar una tarea
    deleteTask: async (id: number): Promise<void> => {
        try {
            await axios.delete(`${API_URL}/${id}`);
        } catch (error) {
            console.error('Error al eliminar la tarea:', error);
            throw error;
        }
    },

    // Obtener tareas por rango de fechas
    getTasksByDateRange: async (start: string, end: string): Promise<Task[]> => {
        try {
            const response = await axios.get<Task[]>(`${API_URL}/calendar/${start}/${end}`);
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error al obtener las tareas por rango de fechas:', error);
            return [];
        }
    }
}; 