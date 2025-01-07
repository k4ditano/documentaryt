import type { Page, Folder } from '../types';
interface File {
    id: string;
    name: string;
    url: string;
    created_at: string;
    user_id: string;
    page_id: string;
}
export declare const storageService: {
    getPages(): Promise<Page[]>;
    getPage(id: string): Promise<Page>;
    createPage(title: string, parent_id?: string | null): Promise<Page>;
    updatePage: (pageId: string, updates: Partial<Page>) => Promise<Page>;
    deletePage(id: string): Promise<void>;
    getFolders(): Promise<Folder[]>;
    createFolder(name: string, parent_id?: string | null): Promise<Folder>;
    updateFolder(id: string, updates: Partial<Folder>): Promise<Folder>;
    deleteFolder(id: string): Promise<void>;
    uploadFile(formData: FormData, page_id: string): Promise<File>;
    getPageFiles(page_id: string): Promise<File[]>;
    deleteFile(id: string): Promise<void>;
    updatePositions(updates: Array<{
        id: string;
        type: string;
        position: number;
        parent_id: string | null;
    }>): Promise<any>;
};
export {};
