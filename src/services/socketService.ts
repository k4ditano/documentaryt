import io, { Socket } from 'socket.io-client';
import { getToken } from './authService';

type EventHandler = (...args: any[]) => void;

class SocketService {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 30000;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private eventHandlers: Map<string, Set<EventHandler>> = new Map();
    private isInitializing = false;
    private lastEventTimestamps: Map<string, number> = new Map();
    private debounceTime = 5000;
    private isConnected = false;

    constructor() {
        console.log('SocketService creado');
    }

    private async initSocket() {
        if (this.isInitializing || this.isConnected) {
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

            if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
            }

            this.socket = io(wsUrl, {
                auth: { token },
                transports: ['websocket'],
                reconnection: false,
                path: '/socket.io',
                timeout: 20000
            });

            this.setupEventListeners();
        } catch (error) {
            console.error('Error de inicialización:', error);
            this.isConnected = false;
        } finally {
            this.isInitializing = false;
        }
    }

    private setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('Conexión establecida');
            this.reconnectAttempts = 0;
            this.isConnected = true;
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
            this.resubscribeEvents();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Desconexión:', reason);
            this.isConnected = false;
            if (reason === 'io server disconnect' || reason === 'transport close') {
                this.attemptReconnect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('Error de conexión:', error);
            this.isConnected = false;
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
            if (!this.isConnected) {
                console.log(`Intento ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`);
                this.reconnectAttempts++;
                this.initSocket();
            }
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
                    } else {
                        console.log(`Evento ${event} ignorado por debounce`);
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

        if (!this.isConnected) {
            this.initSocket();
        } else {
            const handler = (data: T) => {
                const now = Date.now();
                const lastTimestamp = this.lastEventTimestamps.get(event) || 0;
                
                if (now - lastTimestamp >= this.debounceTime) {
                    this.lastEventTimestamps.set(event, now);
                    callback(data);
                } else {
                    console.log(`Evento ${event} ignorado por debounce`);
                }
            };
            this.socket?.on(event, handler);
        }
    }

    public off<T>(event: string, callback: (data: T) => void) {
        this.eventHandlers.get(event)?.delete(callback as EventHandler);
        if (this.socket?.connected) {
            this.socket.off(event, callback);
        }
    }

    public emit<T>(event: string, data: T) {
        if (!this.isConnected) {
            console.log('No hay conexión activa');
            return;
        }
        this.socket?.emit(event, data);
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
        this.isConnected = false;
        this.reconnectAttempts = 0;
    }
}

const socketService = new SocketService();
export default socketService; 