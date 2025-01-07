import React from 'react';
import type { Page, Folder, PageUpdate } from '../types';
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
declare const AppContext: React.Context<AppContextType | undefined>;
export declare const AppProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useApp: () => AppContextType;
export default AppContext;
