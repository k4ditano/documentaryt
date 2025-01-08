import type { User } from '../types/index';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

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
      console.log('Intentando login con:', { email });
      const response = await axios.post<LoginResponse>(`${API_URL}/login`, { 
        email, 
        password 
      });

      console.log('Respuesta de login:', response.data);
      if (response.data.token) {
        this.setToken(response.data.token);
        this.setUser(response.data.user);
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
        this.setToken(response.data.token);
        this.setUser(response.data.user);
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
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      this.clearSession();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      
      if (!token) {
        console.log('No hay token almacenado');
        return null;
      }

      // Intentar obtener el usuario actual del servidor
      const response = await axios.get<User>(`${API_URL}/me`);
      if (response.data) {
        this.setUser(response.data);
        return response.data;
      }
      
      return null;
    } catch (error) {
      const axiosError = error as AxiosErrorResponse;
      if (axiosError.response?.status === 401) {
        this.clearSession();
      }
      console.error('Error al obtener el usuario actual:', error);
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeToken(): void {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }

  private setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  }

  private isTokenValid(token: string): boolean {
    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();

export const getToken = (): string | null => {
  return authService.getToken();
};

export const setToken = (token: string): void => {
  authService.setToken(token);
};

export const removeToken = (): void => {
  authService.removeToken();
}; 