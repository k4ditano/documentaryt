import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

interface Page {
  id: string;
  title: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  last_modified?: string;
}

interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  created_at?: string;
  updated_at?: string;
}

interface PageUpdate extends Partial<Page> {
  tags?: string;
}

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
      setPages(fetchedPages);
    } catch (error) {
      console.error('Error al cargar las páginas:', error);
    }
  };

  const refreshFolders = async () => {
    try {
      const fetchedFolders = await storageService.getFolders();
      setFolders(fetchedFolders);
    } catch (error) {
      console.error('Error al cargar las carpetas:', error);
    }
  };

  const createPage = async (title: string, parent_id: string | null = null) => {
    try {
      const newPage = await storageService.createPage(title, parent_id);
      setPages(prev => [...prev, newPage]);
      return newPage;
    } catch (error) {
      console.error('Error al crear la página:', error);
      throw error;
    }
  };

  const updatePage = async (id: string, data: PageUpdate) => {
    try {
      const updatedPage = await storageService.updatePage(id, data);
      setPages(prev => prev.map(page => 
        page.id === id ? { ...page, ...updatedPage } : page
      ));
      return updatedPage;
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
      setFolders(prev => [...prev, newFolder]);
      return newFolder;
    } catch (error) {
      console.error('Error al crear la carpeta:', error);
      throw error;
    }
  };

  const updateFolder = async (id: string, data: Partial<Folder>) => {
    try {
      const updatedFolder = await storageService.updateFolder(id, data);
      setFolders(prev => prev.map(folder => 
        folder.id === id ? updatedFolder : folder
      ));
      return updatedFolder;
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