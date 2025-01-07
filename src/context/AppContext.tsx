import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import type { Page, Folder, PageUpdate } from '../types/index';

interface AppContextType {
  pages: Page[];
  folders: Folder[];
  setPages: React.Dispatch<React.SetStateAction<Page[]>>;
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  refreshPages: () => Promise<void>;
  refreshFolders: () => Promise<void>;
  createPage: (title: string, parent_id: string | null) => Promise<Page>;
  updatePage: (id: string, data: PageUpdate) => Promise<Page>;
  deletePage: (id: string) => Promise<void>;
  createFolder: (name: string, parent_id: string | null) => Promise<Folder>;
  updateFolder: (id: string, data: Partial<Folder>) => Promise<Folder>;
  deleteFolder: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  const refreshPages = async () => {
    try {
      const fetchedPages = await storageService.getPages();
      setPages(fetchedPages as Page[]);
    } catch (error) {
      console.error('Error al cargar las páginas:', error);
    }
  };

  const refreshFolders = async () => {
    try {
      const fetchedFolders = await storageService.getFolders();
      setFolders(fetchedFolders as Folder[]);
    } catch (error) {
      console.error('Error al cargar las carpetas:', error);
    }
  };

  const createPage = async (title: string, parent_id: string | null = null) => {
    try {
      const newPage = await storageService.createPage(title, parent_id);
      setPages(prev => [...prev, newPage as Page]);
      return newPage as Page;
    } catch (error) {
      console.error('Error al crear la página:', error);
      throw error;
    }
  };

  const updatePage = async (id: string, data: PageUpdate) => {
    try {
      const updatedPage = await storageService.updatePage(id, data);
      setPages(prev => prev.map(page => 
        page.id === id ? { ...page, ...(updatedPage as Page) } : page
      ));
      return updatedPage as Page;
    } catch (error) {
      console.error('Error al actualizar la página:', error);
      throw error;
    }
  };

  const deletePage = async (id: string) => {
    try {
      await storageService.deletePage(id);
      setPages(prev => prev.filter(page => page.id !== id));
    } catch (error) {
      console.error('Error al eliminar la página:', error);
      throw error;
    }
  };

  const createFolder = async (name: string, parent_id: string | null = null) => {
    try {
      const newFolder = await storageService.createFolder(name, parent_id);
      setFolders(prev => [...prev, newFolder as Folder]);
      return newFolder as Folder;
    } catch (error) {
      console.error('Error al crear la carpeta:', error);
      throw error;
    }
  };

  const updateFolder = async (id: string, data: Partial<Folder>) => {
    try {
      const updatedFolder = await storageService.updateFolder(id, data);
      setFolders(prev => prev.map(folder => 
        folder.id === id ? updatedFolder as Folder : folder
      ));
      return updatedFolder as Folder;
    } catch (error) {
      console.error('Error al actualizar la carpeta:', error);
      throw error;
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      await storageService.deleteFolder(id);
      setFolders(prev => prev.filter(folder => folder.id !== id));
    } catch (error) {
      console.error('Error al eliminar la carpeta:', error);
      throw error;
    }
  };

  useEffect(() => {
    refreshPages();
    refreshFolders();
  }, []);

  return (
    <AppContext.Provider value={{
      pages,
      folders,
      setPages,
      setFolders,
      refreshPages,
      refreshFolders,
      createPage,
      updatePage,
      deletePage,
      createFolder,
      updateFolder,
      deleteFolder
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext; 