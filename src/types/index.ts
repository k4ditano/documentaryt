/**
 * Definiciones de tipos principales para la aplicación
 * Última actualización: 2024-01-07
 */

export * from './folder';
export * from './notification';
export * from './reminder';
export * from './page';

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