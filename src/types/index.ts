/**
 * Definiciones de tipos principales para la aplicación
 * Última actualización: 2024-01-07
 */

export interface UserSettings {
  theme: 'light' | 'dark';
  language: string;
  emailNotifications: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  title: string;
  content: string;
  parent_id: string | null;
  position?: number;
  created_at: string;
  updated_at: string;
  completed?: boolean;
  due_date?: string;
  tags: string;
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
  created_at: string;
  updated_at: string;
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

export interface Reminder {
  id: string;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
} 