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
class TaskService {
    constructor() {
        Object.defineProperty(this, "lastFetch", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "cachedTasks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "cacheTimeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 30000
        }); // 30 segundos
        Object.defineProperty(this, "isFetching", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "fetchQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    processFetchQueue() {
        while (this.fetchQueue.length > 0) {
            const resolve = this.fetchQueue.shift();
            if (resolve) {
                resolve();
            }
        }
    }
    async getAllTasks() {
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
            const response = await axios.get(API_URL);
            console.log('Respuesta getAllTasks:', response.data);
            this.lastFetch = now;
            this.cachedTasks = Array.isArray(response.data) ? response.data : [];
            // Procesar cola de solicitudes pendientes
            this.processFetchQueue();
            return this.cachedTasks;
        }
        catch (error) {
            console.error('Error al obtener las tareas:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                window.location.href = '/login';
            }
            return this.cachedTasks;
        }
        finally {
            this.isFetching = false;
        }
    }
    async createTask(task) {
        try {
            const response = await axios.post(API_URL, task);
            this.invalidateCache();
            return response.data;
        }
        catch (error) {
            console.error('Error al crear la tarea:', error);
            throw error;
        }
    }
    async updateTask(id, taskData) {
        try {
            const response = await axios.put(`${API_URL}/${id}`, taskData);
            this.invalidateCache();
            return response.data;
        }
        catch (error) {
            console.error('Error al actualizar la tarea:', error);
            throw error;
        }
    }
    async deleteTask(id) {
        try {
            await axios.delete(`${API_URL}/${id}`);
            this.invalidateCache();
        }
        catch (error) {
            console.error('Error al eliminar la tarea:', error);
            throw error;
        }
    }
    async getTasksByDateRange(start, end) {
        try {
            const response = await axios.get(`${API_URL}/calendar/${start}/${end}`);
            return Array.isArray(response.data) ? response.data : [];
        }
        catch (error) {
            console.error('Error al obtener las tareas por rango de fechas:', error);
            return [];
        }
    }
    invalidateCache() {
        this.lastFetch = 0;
        this.cachedTasks = [];
    }
}
export const taskService = new TaskService();
