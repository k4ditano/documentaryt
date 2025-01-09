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

class TaskService {
    private lastFetch: number = 0;
    private cachedTasks: Task[] = [];
    private cacheTimeout: number = 30000; // 30 segundos
    private isFetching: boolean = false;
    private fetchQueue: Array<() => void> = [];

    private processFetchQueue() {
        while (this.fetchQueue.length > 0) {
            const resolve = this.fetchQueue.shift();
            if (resolve) {
                resolve();
            }
        }
    }

    public async getAllTasks(): Promise<Task[]> {
        try {
            const now = Date.now();

            // Si hay una solicitud en curso, esperar a que termine
            if (this.isFetching) {
                console.log('Esperando solicitud en curso...');
                return new Promise((resolve) => {
                    this.fetchQueue.push(() => resolve(this.cachedTasks));
                });
            }

            // Usar caché si está disponible y no ha expirado
            if (this.cachedTasks.length > 0 && now - this.lastFetch < this.cacheTimeout) {
                console.log('Retornando tareas desde caché');
                return this.cachedTasks;
            }

            this.isFetching = true;
            console.log('Solicitando todas las tareas a:', API_URL);
            
            const response = await axios.get<Task[]>(API_URL);
            console.log('Respuesta getAllTasks:', response.data);
            
            this.lastFetch = now;
            this.cachedTasks = Array.isArray(response.data) ? response.data : [];
            
            // Procesar cola de solicitudes pendientes
            this.processFetchQueue();
            
            return this.cachedTasks;
        } catch (error) {
            console.error('Error al obtener las tareas:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                window.location.href = '/login';
            }
            return this.cachedTasks;
        } finally {
            this.isFetching = false;
        }
    }

    public async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Task> {
        try {
            const response = await axios.post<Task>(API_URL, task);
            this.invalidateCache();
            return response.data;
        } catch (error) {
            console.error('Error al crear la tarea:', error);
            throw error;
        }
    }

    public async updateTask(id: number, taskData: Partial<Task>): Promise<Task> {
        try {
            const response = await axios.put<Task>(`${API_URL}/${id}`, taskData);
            this.invalidateCache();
            return response.data;
        } catch (error) {
            console.error('Error al actualizar la tarea:', error);
            throw error;
        }
    }

    public async deleteTask(id: number): Promise<void> {
        try {
            await axios.delete(`${API_URL}/${id}`);
            this.invalidateCache();
        } catch (error) {
            console.error('Error al eliminar la tarea:', error);
            throw error;
        }
    }

    public async getTasksByDateRange(start: string, end: string): Promise<Task[]> {
        try {
            const response = await axios.get<Task[]>(`${API_URL}/calendar/${start}/${end}`);
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error al obtener las tareas por rango de fechas:', error);
            return [];
        }
    }

    private invalidateCache() {
        this.lastFetch = 0;
        this.cachedTasks = [];
    }
}

export const taskService = new TaskService(); 