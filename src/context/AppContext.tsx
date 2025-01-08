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
  refreshPages: () => Promise<void>;
  refreshFolders: () => Promise<void>;
  createPage: (page: Partial<Page>) => Promise<Page>;
  updatePage: (id: string, page: Partial<Page>) => Promise<Page>;
  deletePage: (id: string) => Promise<void>;
  createFolder: (folder: Partial<Folder>) => Promise<Folder>;
  updateFolder: (id: string, folder: Partial<Folder>) => Promise<Folder>;
  deleteFolder: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  pages: [],
  folders: [],
  tasks: [],
  loading: false,
  error: null,
  refreshData: async () => {},
  refreshPages: async () => {},
  refreshFolders: async () => {},
  createPage: async () => ({ id: '', title: '', content: '', parent_id: null, created_at: '', updated_at: '', user_id: 0 }),
  updatePage: async () => ({ id: '', title: '', content: '', parent_id: null, created_at: '', updated_at: '', user_id: 0 }),
  deletePage: async () => {},
  createFolder: async () => ({ id: '', name: '', parent_id: null, created_at: '', updated_at: '', user_id: 0 }),
  updateFolder: async () => ({ id: '', name: '', parent_id: null, created_at: '', updated_at: '', user_id: 0 }),
  deleteFolder: async () => {},
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
        axios.get<Page[]>('/api/pages'),
        axios.get<Folder[]>('/api/folders'),
        axios.get<Task[]>('/api/tasks')
      ]);

      setPages(Array.isArray(pagesRes.data) ? pagesRes.data : []);
      setFolders(Array.isArray(foldersRes.data) ? foldersRes.data : []);
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
    } catch (err: any) {
      console.error('Error al cargar los datos:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPages = async () => {
    try {
      const response = await axios.get<Page[]>('/api/pages');
      setPages(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error('Error al recargar páginas:', err);
    }
  };

  const refreshFolders = async () => {
    try {
      const response = await axios.get<Folder[]>('/api/folders');
      setFolders(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error('Error al recargar carpetas:', err);
    }
  };

  const createPage = async (page: Partial<Page>): Promise<Page> => {
    const response = await axios.post<Page>('/api/pages', page);
    await refreshPages();
    return response.data;
  };

  const updatePage = async (id: string, page: Partial<Page>): Promise<Page> => {
    const response = await axios.put<Page>(`/api/pages/${id}`, page);
    await refreshPages();
    return response.data;
  };

  const deletePage = async (id: string): Promise<void> => {
    await axios.delete(`/api/pages/${id}`);
    await refreshPages();
  };

  const createFolder = async (folder: Partial<Folder>): Promise<Folder> => {
    const response = await axios.post<Folder>('/api/folders', folder);
    await refreshFolders();
    return response.data;
  };

  const updateFolder = async (id: string, folder: Partial<Folder>): Promise<Folder> => {
    const response = await axios.put<Folder>(`/api/folders/${id}`, folder);
    await refreshFolders();
    return response.data;
  };

  const deleteFolder = async (id: string): Promise<void> => {
    await axios.delete(`/api/folders/${id}`);
    await refreshFolders();
  };

  useEffect(() => {
    fetchData();
    
    // Suscribirse a actualizaciones en tiempo real
    socketService.on('pageUpdated', () => refreshPages());
    socketService.on('folderUpdated', () => refreshFolders());
    
    return () => {
      socketService.off('pageUpdated');
      socketService.off('folderUpdated');
    };
  }, [fetchData]);

  return (
    <AppContext.Provider value={{
      pages,
      folders,
      tasks,
      loading,
      error,
      refreshData: fetchData,
      refreshPages,
      refreshFolders,
      createPage,
      updatePage,
      deletePage,
      createFolder,
      updateFolder,
      deleteFolder,
    }}>
      {children}
    </AppContext.Provider>
  );
}; 