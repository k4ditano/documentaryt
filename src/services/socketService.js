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
            value: 5000
        });
        Object.defineProperty(this, "reconnectTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.initSocket();
    }
    initSocket() {
        const token = getToken();
        if (!token) {
            console.log('No hay token disponible para la conexión websocket');
            return;
        }
        const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
        if (this.socket?.connected) {
            console.log('Ya existe una conexión websocket activa');
            return;
        }
        this.socket = io(wsUrl, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });
        this.setupEventListeners();
    }
    setupEventListeners() {
        if (!this.socket)
            return;
        this.socket.on('connect', () => {
            console.log('Conexión websocket establecida');
            this.reconnectAttempts = 0;
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
        });
        this.socket.on('disconnect', (reason) => {
            console.log('Desconexión websocket:', reason);
            if (reason === 'io server disconnect') {
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
    attemptReconnect() {
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
    on(event, callback) {
        if (!this.socket) {
            this.initSocket();
        }
        this.socket?.on(event, callback);
    }
    off(event, callback) {
        this.socket?.off(event, callback);
    }
    emit(event, data) {
        if (!this.socket?.connected) {
            console.log('No hay conexión websocket activa');
            return;
        }
        this.socket.emit(event, data);
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
    }
}
const socketService = new SocketService();
export default socketService;
