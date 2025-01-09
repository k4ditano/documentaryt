import io from 'socket.io-client';
import { getToken } from './authService';
class SocketService {
    constructor() {
        Object.defineProperty(this, "socket", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "reconnectAttempts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "maxReconnectAttempts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 5
        });
        Object.defineProperty(this, "reconnectDelay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 30000
        });
        Object.defineProperty(this, "reconnectTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "eventHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "isInitializing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "lastEventTimestamps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "debounceTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 5000
        });
        Object.defineProperty(this, "isConnected", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        console.log('SocketService creado');
    }
    async initSocket() {
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
        }
        catch (error) {
            console.error('Error de inicialización:', error);
            this.isConnected = false;
        }
        finally {
            this.isInitializing = false;
        }
    }
    setupEventListeners() {
        if (!this.socket)
            return;
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
    attemptReconnect() {
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
    resubscribeEvents() {
        if (!this.socket)
            return;
        this.eventHandlers.forEach((handlers, event) => {
            handlers.forEach(handler => {
                this.socket?.on(event, (data) => {
                    const now = Date.now();
                    const lastTimestamp = this.lastEventTimestamps.get(event) || 0;
                    if (now - lastTimestamp >= this.debounceTime) {
                        this.lastEventTimestamps.set(event, now);
                        handler(data);
                    }
                    else {
                        console.log(`Evento ${event} ignorado por debounce`);
                    }
                });
            });
        });
    }
    on(event, callback) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event)?.add(callback);
        if (!this.isConnected) {
            this.initSocket();
        }
        else {
            const handler = (data) => {
                const now = Date.now();
                const lastTimestamp = this.lastEventTimestamps.get(event) || 0;
                if (now - lastTimestamp >= this.debounceTime) {
                    this.lastEventTimestamps.set(event, now);
                    callback(data);
                }
                else {
                    console.log(`Evento ${event} ignorado por debounce`);
                }
            };
            this.socket?.on(event, handler);
        }
    }
    off(event, callback) {
        this.eventHandlers.get(event)?.delete(callback);
        if (this.socket?.connected) {
            this.socket.off(event, callback);
        }
    }
    emit(event, data) {
        if (!this.isConnected) {
            console.log('No hay conexión activa');
            return;
        }
        this.socket?.emit(event, data);
    }
    disconnect() {
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
