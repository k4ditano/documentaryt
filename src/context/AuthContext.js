import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const initAuth = async () => {
            try {
                console.log('Iniciando autenticación');
                setLoading(true);
                const token = authService.getToken();
                console.log('Token encontrado:', !!token);
                if (token) {
                    const userData = await authService.getCurrentUser();
                    if (userData) {
                        setUser(userData);
                        setIsAuthenticated(true);
                    } else {
                        authService.removeToken();
                        setIsAuthenticated(false);
                    }
                }
            } catch (error) {
                console.log('Error específico:', error.message);
                authService.removeToken();
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);
    const login = async (email, password) => {
        try {
            setLoading(true);
            const response = await authService.login(email, password);
            setUser(response.user);
            setIsAuthenticated(true);
            setError(null);
        }
        catch (error) {
            console.error('Error al iniciar sesión:', error);
            setError('Credenciales inválidas');
            setIsAuthenticated(false);
            throw error;
        }
        finally {
            setLoading(false);
        }
    };
    const register = async (username, email, password) => {
        try {
            setLoading(true);
            const response = await authService.register(username, email, password);
            setUser(response.user);
            setIsAuthenticated(true);
            setError(null);
        }
        catch (error) {
            console.error('Error al registrar usuario:', error);
            setError('Error al registrar usuario');
            setIsAuthenticated(false);
            throw error;
        }
        finally {
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
            navigate('/login');
        }
        catch (error) {
            console.error('Error al cerrar sesión:', error);
            setError('Error al cerrar sesión');
            throw error;
        }
        finally {
            setLoading(false);
        }
    };
    const updateProfile = async (data) => {
        try {
            if (!user)
                throw new Error('No hay usuario autenticado');
            const updatedUser = await authService.getCurrentUser(); // Temporal hasta implementar updateProfile
            if (updatedUser) {
                setUser(updatedUser);
                setError(null);
            }
        }
        catch (error) {
            console.error('Error al actualizar perfil:', error);
            setError('Error al actualizar perfil');
            throw error;
        }
    };
    const updatePassword = async (currentPassword, newPassword) => {
        try {
            if (!user)
                throw new Error('No hay usuario autenticado');
            // Temporal hasta implementar updatePassword
            setError(null);
        }
        catch (error) {
            console.error('Error al actualizar contraseña:', error);
            setError('Error al actualizar contraseña');
            throw error;
        }
    };
    const uploadAvatar = async (file) => {
        try {
            if (!user)
                throw new Error('No hay usuario autenticado');
            // Temporal hasta implementar uploadAvatar
            setError(null);
        }
        catch (error) {
            console.error('Error al subir avatar:', error);
            setError('Error al subir avatar');
            throw error;
        }
    };
    const clearError = () => setError(null);
    const value = {
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
    if (loading) {
        return _jsx("div", { children: "Cargando..." });
    }
    return (_jsx(AuthContext.Provider, { value: value, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
export default AuthContext;
