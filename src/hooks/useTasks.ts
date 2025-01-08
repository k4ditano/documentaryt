import { usePolling } from './usePolling';
import axios from 'axios';
import type { Task } from '../types';

export function useTasks() {
  const fetchTasks = async () => {
    const response = await axios.get<Task[]>('/tasks');
    return response.data;
  };

  return usePolling(fetchTasks, 'tasks', {
    interval: 30000, // 30 segundos
    cacheTime: 5000  // 5 segundos de caché
  });
} 