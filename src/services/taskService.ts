import axios from 'axios';

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

// Configurar axios para incluir credenciales
axios.defaults.withCredentials = true;

// Interceptor para manejar errores
axios.interceptors.response.use(
    response => response,
    error => {
        console.error('Error en la petición:', error);
        if (error.response) {
            console.error('Respuesta del servidor:', error.response.data);
        }
        throw error;
    }
);

export const taskService = {
    // Obtener todas las tareas
    getAllTasks: async (): Promise<Task[]> => {
        try {
            console.log('Solicitando todas las tareas a:', API_URL);
            const response = await axios.get<Task[]>(API_URL);
            console.log('Respuesta getAllTasks:', response.data);
            return response.data || [];
        } catch (error) {
            console.error('Error al obtener las tareas:', error);
            throw new Error('Error al cargar los datos: ' + (error as Error).message);
        }
    },

    // Crear una nueva tarea
    createTask: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Task> => {
        console.log('Creando tarea con datos:', task);
        const taskWithDefaults = {
            ...task,
            status: task.status || 'pending',
            priority: task.priority || 'medium',
            linked_pages: task.linked_pages || []
        };
        console.log('Enviando tarea con defaults:', taskWithDefaults);
        const response = await axios.post<Task>(API_URL, taskWithDefaults, {
            withCredentials: true
        });
        console.log('Respuesta de createTask:', response.data);
        return response.data;
    },

    // Actualizar una tarea
    updateTask: async (id: number, taskData: Partial<Task>): Promise<Task> => {
        try {
            console.log('Actualizando tarea:', id);
            console.log('Datos completos recibidos:', taskData);
            console.log('Páginas enlazadas a enviar:', taskData.linked_pages);
            
            // Asegurarnos de que los datos estén en el formato correcto
            const dataToSend = {
                ...taskData,
                linked_pages: Array.isArray(taskData.linked_pages) ? taskData.linked_pages : [],
                id: id
            };
            
            console.log('Datos completos a enviar al servidor:', dataToSend);
            const response = await axios.put<Task>(`${API_URL}/${id}`, dataToSend, {
                withCredentials: true
            });
            console.log('Respuesta completa del servidor:', response.data);
            console.log('Páginas enlazadas en la respuesta:', response.data.linked_pages);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar la tarea:', error);
            throw error;
        }
    },

    // Eliminar una tarea
    deleteTask: async (id: number): Promise<void> => {
        console.log(`Eliminando tarea ${id}`);
        await axios.delete(`${API_URL}/${id}`, {
            withCredentials: true
        });
    },

    // Obtener tareas por rango de fechas (para el calendario)
    getTasksByDateRange: async (start: string, end: string): Promise<Task[]> => {
        console.log(`Obteniendo tareas entre ${start} y ${end}`);
        const response = await axios.get<Task[]>(`${API_URL}/calendar/${start}/${end}`, {
            withCredentials: true
        });
        console.log('Respuesta de getTasksByDateRange:', response.data);
        return response.data;
    }
}; 