import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types/index';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const token = authService.getToken();
        if (token) {
          const userData = await authService.getCurrentUser();
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Si no hay usuario pero hay token, limpiar el token
            authService.removeToken();
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        authService.removeToken();
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Credenciales inválidas');
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError('Error al cerrar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register: async (username: string, email: string, password: string) => {
      try {
        setLoading(true);
        const response = await authService.register(username, email, password);
        setUser(response.user);
        setIsAuthenticated(true);
        setError(null);
      } catch (error) {
        console.error('Error al registrar usuario:', error);
        setError('Error al registrar usuario');
        setIsAuthenticated(false);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    logout,
    updateProfile: async (data: Partial<User>) => {
      try {
        if (!user) throw new Error('No hay usuario autenticado');
        const updatedUser = await authService.updateProfile(data);
        setUser(updatedUser);
        setError(null);
      } catch (error) {
        console.error('Error al actualizar perfil:', error);
        setError('Error al actualizar perfil');
        throw error;
      }
    },
    updatePassword,
    uploadAvatar,
    clearError: () => setError(null)
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 