import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { Task } from '../types/index';
import socketService from '../services/socketService';

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refreshTasks: () => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, task: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<Task[]>('/api/tasks');
      setTasks(response.data);
    } catch (err) {
      setError('Error al cargar las tareas');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();

    // Suscribirse a actualizaciones via websocket
    socketService.subscribe('task:update', (data: Task) => {
      setTasks(prev => prev.map(t => t.id === data.id ? data : t));
    });

    socketService.subscribe('task:create', (data: Task) => {
      setTasks(prev => [...prev, data]);
    });

    socketService.subscribe('task:delete', (id: string) => {
      setTasks(prev => prev.filter(t => t.id !== id));
    });

    return () => {
      // Limpiar suscripciones
      socketService.unsubscribe('task:update', () => {});
      socketService.unsubscribe('task:create', () => {});
      socketService.unsubscribe('task:delete', () => {});
    };
  }, [fetchTasks]);

  const createTask = async (task: Partial<Task>): Promise<Task> => {
    try {
      const response = await axios.post<Task>('/api/tasks', task);
      return response.data;
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    }
  };

  const updateTask = async (id: string, task: Partial<Task>): Promise<Task> => {
    try {
      const response = await axios.put<Task>(`/api/tasks/${id}`, task);
      return response.data;
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    try {
      await axios.delete(`/api/tasks/${id}`);
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    refreshTasks: fetchTasks,
    createTask,
    updateTask,
    deleteTask
  };
}; 