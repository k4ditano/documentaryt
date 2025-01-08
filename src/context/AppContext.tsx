import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import socketService from '../services/socketService';
import type { Page, Folder, Task } from '../types/index';

interface AppContextType {
  pages: Page[];
  folders: Folder[];
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  pages: [],
  folders: [],
  tasks: [],
  loading: false,
  error: null,
  refreshData: async () => {},
});

export const useApp = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [pagesRes, foldersRes, tasksRes] = await Promise.all([
        axios.get<{ data: Page[] | { error: string } }>('/api/pages'),
        axios.get<{ data: Folder[] | { error: string } }>('/api/folders'),
        axios.get<{ data: Task[] | { error: string } }>('/api/tasks')
      ]);

      // Validar y procesar las respuestas
      if ('error' in pagesRes.data) {
        console.error('Error en páginas:', pagesRes.data.error);
        setPages([]);
      } else {
        setPages(Array.isArray(pagesRes.data) ? pagesRes.data : []);
      }

      if ('error' in foldersRes.data) {
        console.error('Error en carpetas:', foldersRes.data.error);
        setFolders([]);
      } else {
        setFolders(Array.isArray(foldersRes.data) ? foldersRes.data : []);
      }

      if ('error' in tasksRes.data) {
        console.error('Error en tareas:', tasksRes.data.error);
        setTasks([]);
      } else {
        setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
      }

    } catch (err) {
      console.error('Error al cargar los datos:', err);
      setError('Error al cargar los datos');
      // Establecer arrays vacíos en caso de error
      setPages([]);
      setFolders([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Suscribirse a actualizaciones via websocket
    socketService.subscribe('page:update', (data: Page) => {
      setPages(prev => prev.map(p => p.id === data.id ? data : p));
    });

    socketService.subscribe('page:create', (data: Page) => {
      setPages(prev => [...prev, data]);
    });

    socketService.subscribe('page:delete', (id: string) => {
      setPages(prev => prev.filter(p => p.id !== id));
    });

    socketService.subscribe('folder:update', (data: Folder) => {
      setFolders(prev => prev.map(f => f.id === data.id ? data : f));
    });

    socketService.subscribe('folder:create', (data: Folder) => {
      setFolders(prev => [...prev, data]);
    });

    socketService.subscribe('folder:delete', (id: string) => {
      setFolders(prev => prev.filter(f => f.id !== id));
    });

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
      socketService.unsubscribe('page:update', () => {});
      socketService.unsubscribe('page:create', () => {});
      socketService.unsubscribe('page:delete', () => {});
      socketService.unsubscribe('folder:update', () => {});
      socketService.unsubscribe('folder:create', () => {});
      socketService.unsubscribe('folder:delete', () => {});
      socketService.unsubscribe('task:update', () => {});
      socketService.unsubscribe('task:create', () => {});
      socketService.unsubscribe('task:delete', () => {});
    };
  }, [fetchData]);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return (
    <AppContext.Provider value={{ pages, folders, tasks, loading, error, refreshData }}>
      {children}
    </AppContext.Provider>
  );
}; 