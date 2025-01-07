import React, { createContext, useContext, useEffect, useState } from 'react';
import { storageService } from '../services/storageService';
import { useAuth } from './AuthContext';
import type { Page, Folder, PageUpdate } from '../types/index';

interface AppContextType {
  pages: Page[];
  folders: Folder[];
  error: string | null;
  isLoading: boolean;
  createPage: (title: string, parent_id: string | null) => Promise<Page>;
  updatePage: (id: string, data: PageUpdate) => Promise<Page>;
  deletePage: (id: string) => Promise<void>;
  createFolder: (name: string, parent_id: string | null) => Promise<Folder>;
  updateFolder: (id: string, data: Partial<Folder>) => Promise<Folder>;
  deleteFolder: (id: string) => Promise<void>;
  clearError: () => void;
  updatePositions: (updates: { id: string; type: 'page' | 'folder'; position: number; parent_id: string | null }[]) => Promise<void>;
}

// Crear un contexto con un valor por defecto más seguro
const defaultContext: AppContextType = {
  pages: [],
  folders: [],
  error: null,
  isLoading: false,
  createPage: async () => { throw new Error('AppContext no ha sido inicializado') },
  updatePage: async () => { throw new Error('AppContext no ha sido inicializado') },
  deletePage: async () => { throw new Error('AppContext no ha sido inicializado') },
  createFolder: async () => { throw new Error('AppContext no ha sido inicializado') },
  updateFolder: async () => { throw new Error('AppContext no ha sido inicializado') },
  deleteFolder: async () => { throw new Error('AppContext no ha sido inicializado') },
  clearError: () => {},
  updatePositions: async () => {},
};

const AppContext = createContext<AppContextType>(defaultContext);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) {
        setPages([]);
        setFolders([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [pagesData, foldersData] = await Promise.all([
          storageService.getPages(),
          storageService.getFolders(),
        ]);
        setPages(pagesData);
        setFolders(foldersData);
      } catch (error) {
        console.error('Error al cargar los datos:', error);
        setError('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  const createPage = async (title: string, parent_id: string | null = null) => {
    try {
      const newPage = await storageService.createPage(title, parent_id);
      setPages(prev => [...prev, newPage]);
      return newPage;
    } catch (error) {
      console.error('Error al crear la página:', error);
      setError('Error al crear la página');
      throw error;
    }
  };

  const updatePage = async (id: string, data: PageUpdate) => {
    try {
      const updatedPage = await storageService.updatePage(id, data);
      setPages(prev => prev.map(page => 
        page.id === id 
          ? { ...page, ...updatedPage, content: data.content || page.content }
          : page
      ));
      return updatedPage;
    } catch (error) {
      console.error('Error al actualizar la página:', error);
      setError('Error al actualizar la página');
      throw error;
    }
  };

  const deletePage = async (id: string) => {
    try {
      await storageService.deletePage(id);
      setPages(prev => prev.filter(page => page.id !== id));
    } catch (error) {
      console.error('Error al eliminar la página:', error);
      setError('Error al eliminar la página');
      throw error;
    }
  };

  const createFolder = async (name: string, parent_id: string | null = null) => {
    try {
      const newFolder = await storageService.createFolder(name, parent_id);
      setFolders(prev => [...prev, newFolder]);
      return newFolder;
    } catch (error) {
      console.error('Error al crear la carpeta:', error);
      setError('Error al crear la carpeta');
      throw error;
    }
  };

  const updateFolder = async (id: string, data: Partial<Folder>) => {
    try {
      const updatedFolder = await storageService.updateFolder(id, data);
      setFolders(prev => prev.map(folder => (folder.id === id ? updatedFolder : folder)));
      return updatedFolder;
    } catch (error) {
      console.error('Error al actualizar la carpeta:', error);
      setError('Error al actualizar la carpeta');
      throw error;
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      await storageService.deleteFolder(id);
      setFolders(prev => prev.filter(folder => folder.id !== id));
    } catch (error) {
      console.error('Error al eliminar la carpeta:', error);
      setError('Error al eliminar la carpeta');
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const updatePositions = async (updates: { id: string; type: 'page' | 'folder'; position: number; parent_id: string | null }[]) => {
    try {
      await storageService.updatePositions(updates);
      
      // Refrescar los datos después de actualizar las posiciones
      const [updatedPages, updatedFolders] = await Promise.all([
        storageService.getPages(),
        storageService.getFolders()
      ]);

      setPages(updatedPages);
      setFolders(updatedFolders);
    } catch (error) {
      console.error('Error al actualizar posiciones:', error);
      throw error;
    }
  };

  const contextValue: AppContextType = {
    pages,
    folders,
    error,
    isLoading,
    createPage,
    updatePage,
    deletePage,
    createFolder,
    updateFolder,
    deleteFolder,
    clearError,
    updatePositions,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext; 