import { Page, PageMetadata } from '../types/page';
export declare const getPages: () => Promise<PageMetadata[]>;
export declare const getPage: (id: string) => Promise<Page | null>;
export declare const createPage: (page: Omit<Page, "id" | "createdAt" | "lastModified">) => Promise<Page>;
export declare const updatePage: (id: string, updates: Partial<Page>) => Promise<Page | null>;
export declare const deletePage: (id: string) => Promise<boolean>;
