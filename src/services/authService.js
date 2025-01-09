import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
const API_URL = '/auth';
class AuthService {
    async login(email, password) {
        try {
            console.log('Intentando login con:', { email });
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password
            });
            console.log('Respuesta de login:', response.data);
            if (response.data.token) {
                this.setToken(response.data.token);
                this.setUser(response.data.user);
            }
            return response.data;
        }
        catch (error) {
            console.error('Error en login:', error);
            throw error instanceof Error ? error : new Error('Error al iniciar sesión');
        }
    }
    async register(username, email, password) {
        try {
            const response = await axios.post(`${API_URL}/register`, {
                username,
                email,
                password
            });
            if (response.data.token) {
                this.setToken(response.data.token);
                this.setUser(response.data.user);
            }
            return response.data;
        }
        catch (error) {
            console.error('Error en registro:', error);
            throw error instanceof Error ? error : new Error('Error al registrar usuario');
        }
    }
    async logout() {
        try {
            await axios.post(`${API_URL}/logout`);
        }
        catch (error) {
            console.error('Error en logout:', error);
        }
        finally {
            this.clearSession();
        }
    }
    async getCurrentUser() {
        try {
            const token = this.getToken();
            if (!token) {
                console.log('No hay token almacenado');
                return null;
            }
            // Intentar obtener el usuario actual del servidor
            const response = await axios.get(`${API_URL}/me`);
            if (response.data) {
                this.setUser(response.data);
                return response.data;
            }
            return null;
        }
        catch (error) {
            const axiosError = error;
            if (axiosError.response?.status === 401) {
                this.clearSession();
            }
            console.error('Error al obtener el usuario actual:', error);
            return null;
        }
    }
    getToken() {
        return localStorage.getItem('token');
    }
    setToken(token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    removeToken() {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    }
    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }
    clearSession() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
    }
    isTokenValid(token) {
        try {
            const decoded = jwtDecode(token);
            return decoded.exp * 1000 > Date.now();
        }
        catch {
            return false;
        }
    }
}
export const authService = new AuthService();
export const getToken = () => {
    return authService.getToken();
};
export const setToken = (token) => {
    authService.setToken(token);
};
export const removeToken = () => {
    authService.removeToken();
};
