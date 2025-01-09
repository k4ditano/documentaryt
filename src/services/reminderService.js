import axios from 'axios';
const API_URL = '/api/reminders';
export const reminderService = {
    // Crear un nuevo recordatorio
    createReminder: async (data) => {
        const response = await axios.post(API_URL, {
            title: data.title,
            message: data.message,
            reminderTime: data.reminderTime.toISOString()
        });
        return response.data.reminderId;
    },
    // Obtener todos los recordatorios pendientes
    getReminders: async () => {
        const response = await axios.get(API_URL);
        return response.data;
    },
    // Cancelar un recordatorio
    cancelReminder: async (id) => {
        await axios.delete(`${API_URL}/${id}`);
    }
};
