import { usePolling } from './usePolling';
import axios from 'axios';
import type { Notification } from '../types';

export function useNotifications() {
  const fetchNotifications = async () => {
    const response = await axios.get<Notification[]>('/api/notifications');
    return response.data;
  };

  const fetchUnreadCount = async () => {
    const response = await axios.get<{count: number}>('/api/notifications/unread-count');
    return response.data.count;
  };

  const { data: notifications, loading, error, refetch } = usePolling(fetchNotifications, 'notifications', {
    interval: 30000, // 30 segundos
    cacheTime: 5000  // 5 segundos de caché
  });

  const { data: unreadCount } = usePolling(fetchUnreadCount, 'notifications-count', {
    interval: 30000,
    cacheTime: 5000
  });

  return {
    notifications,
    unreadCount: unreadCount || 0,
    loading,
    error,
    refetch
  };
} 