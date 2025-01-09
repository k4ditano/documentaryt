import { usePolling } from './usePolling';
import axios from 'axios';
export function useReminders() {
    const fetchReminders = async () => {
        const response = await axios.get('/api/reminders');
        return response.data;
    };
    return usePolling(fetchReminders, 'reminders', {
        interval: 30000, // 30 segundos
        cacheTime: 5000 // 5 segundos de caché
    });
}