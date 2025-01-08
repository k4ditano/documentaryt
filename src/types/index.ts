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
  id: number;
  username: string;
  email: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Page {
  id: string;
  title: string;
  content?: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  user_id: number;
}

export interface PageWithoutTags extends Omit<Page, 'tags'> {
  tags?: string;
}

export interface PageUpdate {
  title?: string;
  content?: string;
  parent_id?: string | null;
}

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  user_id: number;
}

export interface File {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document';
  size: number;
  upload_date: string;
  page_id?: string;
  user_id: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  page_id?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
} 