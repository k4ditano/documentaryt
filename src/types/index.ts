export * from './auth.types';

export interface UserSettings {
  theme: 'light' | 'dark';
  language: string;
  emailNotifications: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Page {
  id: string;
  title: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  last_modified?: string;
}

export interface PageWithoutTags extends Omit<Page, 'tags'> {
  tags?: string;
}

export interface PageUpdate extends Partial<Page> {
  tags?: string;
}

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface File {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document';
  size: number;
  uploadDate: string;
  pageId?: string;
} 