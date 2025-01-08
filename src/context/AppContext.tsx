import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import socketService from '../services/socketService';
import { Page, Folder, Task } from '../types';

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
        fetch('/api/pages'),
        fetch('/api/folders'),
        fetch('/api/tasks')
      ]);

      const [pagesData, foldersData, tasksData] = await Promise.all([
        pagesRes.json(),
        foldersRes.json(),
        tasksRes.json()
      ]);

      setPages(pagesData);
      setFolders(foldersData);
      setTasks(tasksData);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Suscribirse a actualizaciones via websocket
    socketService.subscribe('page:update', (data) => {
      setPages(prev => prev.map(p => p.id === data.id ? data : p));
    });

    socketService.subscribe('page:create', (data) => {
      setPages(prev => [...prev, data]);
    });

    socketService.subscribe('page:delete', (id) => {
      setPages(prev => prev.filter(p => p.id !== id));
    });

    socketService.subscribe('folder:update', (data) => {
      setFolders(prev => prev.map(f => f.id === data.id ? data : f));
    });

    socketService.subscribe('folder:create', (data) => {
      setFolders(prev => [...prev, data]);
    });

    socketService.subscribe('folder:delete', (id) => {
      setFolders(prev => prev.filter(f => f.id !== id));
    });

    socketService.subscribe('task:update', (data) => {
      setTasks(prev => prev.map(t => t.id === data.id ? data : t));
    });

    socketService.subscribe('task:create', (data) => {
      setTasks(prev => [...prev, data]);
    });

    socketService.subscribe('task:delete', (id) => {
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