import io, { Socket } from 'socket.io-client';
import { getToken } from './authService';

type EventHandler = (...args: any[]) => void;

class SocketService {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 10000;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private eventHandlers: Map<string, Set<EventHandler>> = new Map();
    private isInitializing = false;
    private lastEventTimestamps: Map<string, number> = new Map();
    private debounceTime = 1000;

    constructor() {
        this.initSocket();
    }

    private async initSocket() {
        if (this.isInitializing || (this.socket?.connected && !this.socket?.disconnected)) {
            console.log('Conexión existente o inicialización en progreso');
            return;
        }

        this.isInitializing = true;

        try {
            const token = getToken();
            if (!token) {
                console.log('No hay token disponible');
                return;
            }

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const baseUrl = apiUrl.replace('/api', '');
            const wsUrl = baseUrl;

            console.log('Conectando a:', wsUrl);

            this.socket = io(wsUrl, {
                auth: { token },
                transports: ['websocket'],
                reconnection: true,
                reconnectionDelay: 5000,
                reconnectionDelayMax: 30000,
                reconnectionAttempts: 5,
                path: '/socket.io',
                timeout: 20000
            });

            this.setupEventListeners();
        } catch (error) {
            console.error('Error de inicialización:', error);
        } finally {
            this.isInitializing = false;
        }
    }

    private setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('Conexión establecida');
            this.reconnectAttempts = 0;
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
            this.resubscribeEvents();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Desconexión:', reason);
            if (reason === 'io server disconnect' || reason === 'transport close') {
                this.attemptReconnect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('Error de conexión:', error);
            this.attemptReconnect();
        });
    }

    private attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Máximo de intentos alcanzado');
            return;
        }

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }

        this.reconnectTimer = setTimeout(() => {
            console.log(`Intento ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`);
            this.reconnectAttempts++;
            this.initSocket();
        }, this.reconnectDelay);
    }

    private resubscribeEvents() {
        if (!this.socket) return;

        this.eventHandlers.forEach((handlers, event) => {
            handlers.forEach(handler => {
                this.socket?.on(event, (data: any) => {
                    const now = Date.now();
                    const lastTimestamp = this.lastEventTimestamps.get(event) || 0;
                    
                    if (now - lastTimestamp >= this.debounceTime) {
                        this.lastEventTimestamps.set(event, now);
                        handler(data);
                    }
                });
            });
        });
    }

    public on<T>(event: string, callback: (data: T) => void) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event)?.add(callback as EventHandler);

        if (!this.socket?.connected) {
            this.initSocket();
        } else {
            const handler = (data: T) => {
                const now = Date.now();
                const lastTimestamp = this.lastEventTimestamps.get(event) || 0;
                
                if (now - lastTimestamp >= this.debounceTime) {
                    this.lastEventTimestamps.set(event, now);
                    callback(data);
                }
            };
            this.socket.on(event, handler);
        }
    }

    public off<T>(event: string, callback: (data: T) => void) {
        this.eventHandlers.get(event)?.delete(callback as EventHandler);
        this.socket?.off(event, callback);
    }

    public emit<T>(event: string, data: T) {
        if (!this.socket?.connected) {
            console.log('No hay conexión activa');
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
        this.lastEventTimestamps.clear();
    }
}

const socketService = new SocketService();
export default socketService; 