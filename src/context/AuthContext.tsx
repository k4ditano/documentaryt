import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types';

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
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData as User);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      setError('Error al verificar autenticación');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userData = await authService.login(email, password);
      setUser(userData as User);
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Credenciales inválidas');
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const userData = await authService.register(username, email, password);
      setUser(userData as User);
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      setError('Error al registrar usuario');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError('Error al cerrar sesión');
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) throw new Error('No hay usuario autenticado');
      const updatedUser = await authService.updateProfile(user.id, data);
      setUser(updatedUser as User);
      setError(null);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setError('Error al actualizar perfil');
      throw error;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!user) throw new Error('No hay usuario autenticado');
      await authService.updatePassword(user.id, currentPassword, newPassword);
      setError(null);
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      setError('Error al actualizar contraseña');
      throw error;
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      if (!user) throw new Error('No hay usuario autenticado');
      const updatedUser = await authService.uploadAvatar(user.id, file);
      setUser(updatedUser as User);
      setError(null);
    } catch (error) {
      console.error('Error al subir avatar:', error);
      setError('Error al subir avatar');
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{
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
    }}>
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