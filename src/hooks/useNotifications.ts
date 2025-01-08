import { usePolling } from './usePolling';
import axios from 'axios';
import type { Notification } from '../types/notification';

export function useNotifications() {
  const fetchNotifications = async () => {
    const response = await axios.get<Notification[]>('/api/notifications');
    return response.data;
  };

  return usePolling(fetchNotifications, 'notifications', {
    interval: 30000, // 30 segundos
    cacheTime: 5000  // 5 segundos de caché
  });
} 