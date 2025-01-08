import type { User } from '../types/index';
import axios from 'axios';

const API_URL = '/auth';

interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterResponse {
  user: User;
  token: string;
}

interface AxiosErrorResponse {
  response?: {
    status: number;
    data?: any;
  };
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(`${API_URL}/login`, { 
        email, 
        password 
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error instanceof Error ? error : new Error('Error al iniciar sesión');
    }
  }

  async register(username: string, email: string, password: string): Promise<RegisterResponse> {
    try {
      const response = await axios.post<RegisterResponse>(`${API_URL}/register`, {
        username,
        email,
        password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error instanceof Error ? error : new Error('Error al registrar usuario');
    }
  }

  async logout(): Promise<void> {
    try {
      await axios.post(`${API_URL}/logout`);
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Error en logout:', error);
      localStorage.removeItem('token');
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await axios.get<{user: User}>(`${API_URL}/me`);
      return response.data.user;
    } catch (error) {
      const axiosError = error as AxiosErrorResponse;
      if (axiosError.response?.status === 401) {
        localStorage.removeItem('token');
        return null;
      }
      console.error('Error al obtener el usuario actual:', error);
      return null;
    }
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await axios.put<User>(`${API_URL}/profile`, data);
    return response.data;
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await axios.put(`${API_URL}/password`, { currentPassword, newPassword });
  }

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axios.post<User>(`${API_URL}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  }
}

export const authService = new AuthService(); 