import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
const API_URL = '/auth';
const TOKEN_KEY = 'auth_token';

export const authService = {
    getToken: () => {
        return localStorage.getItem(TOKEN_KEY);
    },

    setToken: (token) => {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        }
    },

    removeToken: () => {
        localStorage.removeItem(TOKEN_KEY);
    },

    getCurrentUser: async () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return null;

        try {
            // Hacer la llamada a tu API para obtener los datos del usuario
            const response = await fetch('/api/user/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get user data');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }
};
