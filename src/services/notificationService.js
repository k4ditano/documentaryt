import axios from 'axios';
const API_URL = '/api/notifications';
export const notificationService = {
    // Obtener todas las notificaciones
    getAllNotifications: async () => {
        const response = await axios.get(API_URL);
        return response.data;
    },
    // Marcar una notificación como leída
    markAsRead: async (id) => {
        await axios.put(`${API_URL}/${id}/read`);
    },
    // Marcar todas las notificaciones como leídas
    markAllAsRead: async () => {
        await axios.put(`${API_URL}/read-all`);
    },
    // Obtener el conteo de notificaciones no leídas
    getUnreadCount: async () => {
        const response = await axios.get(`${API_URL}/unread-count`);
        return response.data.count;
    },
    // Eliminar una notificación
    deleteNotification: async (id) => {
        await axios.delete(`${API_URL}/${id}`);
    }
};
