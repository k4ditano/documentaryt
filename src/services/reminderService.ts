import axios from 'axios';

export interface Reminder {
    id: number;
    user_id: number;
    title: string;
    message: string | null;
    reminder_time: string;
    status: 'pending' | 'sent' | 'cancelled';
    created_at: string;
}

const API_URL = '/api/reminders';

export const reminderService = {
    // Crear un nuevo recordatorio
    createReminder: async (data: { 
        title: string; 
        message?: string; 
        reminderTime: Date;
    }): Promise<number> => {
        const response = await axios.post<{ reminderId: number }>(API_URL, {
            title: data.title,
            message: data.message,
            reminderTime: data.reminderTime.toISOString()
        });
        return response.data.reminderId;
    },

    // Obtener todos los recordatorios pendientes
    getReminders: async (): Promise<Reminder[]> => {
        const response = await axios.get<Reminder[]>(API_URL);
        return response.data;
    },

    // Cancelar un recordatorio
    cancelReminder: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}/${id}`);
    }
}; 