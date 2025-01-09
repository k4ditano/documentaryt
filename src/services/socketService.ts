import io, { Socket } from 'socket.io-client';
import { getToken } from './authService';

type EventHandler = (...args: any[]) => void;

class SocketService {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 5000;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private eventHandlers: Map<string, Set<EventHandler>> = new Map();
    private isInitializing = false;

    constructor() {
        this.initSocket();
    }

    private async initSocket() {
        if (this.isInitializing) {
            console.log('Ya hay una inicialización en progreso');
            return;
        }

        this.isInitializing = true;

        try {
            const token = getToken();
            if (!token) {
                console.log('No hay token disponible para la conexión websocket');
                return;
            }

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const baseUrl = apiUrl.replace('/api', '');
            const wsUrl = baseUrl;

            if (this.socket?.connected) {
                console.log('Ya existe una conexión websocket activa');
                return;
            }

            console.log('Conectando websocket a:', wsUrl);

            this.socket = io(wsUrl, {
                auth: { token },
                transports: ['websocket'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
                path: '/socket.io',
                timeout: 20000
            });

            this.setupEventListeners();
        } catch (error) {
            console.error('Error al inicializar el socket:', error);
        } finally {
            this.isInitializing = false;
        }
    }

    private setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('Conexión websocket establecida');
            this.reconnectAttempts = 0;
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
            
            // Resubscribir a todos los eventos después de reconectar
            this.resubscribeEvents();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Desconexión websocket:', reason);
            if (reason === 'io server disconnect' || reason === 'transport close') {
                this.attemptReconnect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('Error de conexión websocket:', error);
            this.attemptReconnect();
        });

        this.socket.on('error', (error) => {
            console.error('Error en websocket:', error);
        });
    }

    private attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Máximo número de intentos de reconexión alcanzado');
            return;
        }

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }

        this.reconnectTimer = setTimeout(() => {
            console.log(`Intento de reconexión ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`);
            this.reconnectAttempts++;
            this.initSocket();
        }, this.reconnectDelay);
    }

    private resubscribeEvents() {
        if (!this.socket) return;

        this.eventHandlers.forEach((handlers, event) => {
            handlers.forEach(handler => {
                this.socket?.on(event, handler);
            });
        });
    }

    public on<T>(event: string, callback: (data: T) => void) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event)?.add(callback as EventHandler);

        if (!this.socket) {
            this.initSocket();
        } else {
            this.socket.on(event, callback);
        }
    }

    public off<T>(event: string, callback: (data: T) => void) {
        this.eventHandlers.get(event)?.delete(callback as EventHandler);
        this.socket?.off(event, callback);
    }

    public emit<T>(event: string, data: T) {
        if (!this.socket?.connected) {
            console.log('No hay conexión websocket activa');
            return;
        }
        this.socket.emit(event, data);
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.eventHandlers.clear();
    }
}

const socketService = new SocketService();
export default socketService; 