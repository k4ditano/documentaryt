import axios from 'axios';

export interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: 'task' | 'reminder' | 'system';
    read: boolean;
    reference_id: number | null;
    reference_type: string | null;
    created_at: string;
}

const API_URL = '/api/notifications';

export const notificationService = {
    // Obtener todas las notificaciones
    getAllNotifications: async (): Promise<Notification[]> => {
        const response = await axios.get<Notification[]>(API_URL);
        return response.data;
    },

    // Marcar una notificación como leída
    markAsRead: async (id: number): Promise<void> => {
        await axios.put(`${API_URL}/${id}/read`);
    },

    // Marcar todas las notificaciones como leídas
    markAllAsRead: async (): Promise<void> => {
        await axios.put(`${API_URL}/read-all`);
    },

    // Obtener el conteo de notificaciones no leídas
    getUnreadCount: async (): Promise<number> => {
        const response = await axios.get<{ count: number }>(`${API_URL}/unread-count`);
        return response.data.count;
    },

    // Eliminar una notificación
    deleteNotification: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}/${id}`);
    }
}; 