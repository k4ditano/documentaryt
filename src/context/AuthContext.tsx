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
      const token = authService.getToken();
      
      // Si no hay token, simplemente terminamos la inicialización
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          authService.clearSession();
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        authService.clearSession();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []); // Solo se ejecuta una vez al montar el componente

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Credenciales inválidas');
      setIsAuthenticated(false);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authService.register(username, email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      setError('Error al registrar usuario');
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError('Error al cerrar sesión');
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.getCurrentUser(); // Temporal hasta implementar updateProfile
      if (updatedUser) {
        setUser(updatedUser);
        setError(null);
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setError('Error al actualizar perfil');
      throw error;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      // Temporal hasta implementar updatePassword
      setError(null);
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      setError('Error al actualizar contraseña');
      throw error;
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      // Temporal hasta implementar uploadAvatar
      setError(null);
    } catch (error) {
      console.error('Error al subir avatar:', error);
      setError('Error al subir avatar');
      throw error;
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    uploadAvatar,
    clearError
  };

  // Solo mostramos el loader en la inicialización inicial
  if (loading) {
    return null; // En lugar de mostrar "Cargando..."
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