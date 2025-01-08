import { io, Socket } from 'socket.io-client';
import { getToken } from './authService';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 3;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect() {
    if (this.socket?.connected) return;

    const token = getToken();
    if (!token) {
      console.log('No hay token disponible para la conexión websocket');
      return;
    }

    const isProduction = window.location.hostname !== 'localhost';
    const baseURL = isProduction 
      ? 'http://145.223.100.119'
      : 'http://localhost:3001';

    try {
      this.socket = io(baseURL + '/api', {
        auth: { token },
        transports: ['websocket'],
        path: '/socket.io',
        reconnection: true,
        reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: 1000,
        timeout: 5000,
        withCredentials: true
      });

      this.socket.on('connect', () => {
        console.log('Conectado al servidor de websockets');
        this.reconnectAttempts = 0;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Error de conexión websocket:', error.message);
        this.handleConnectionError(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Desconectado del servidor de websockets:', reason);
        if (reason === 'io server disconnect') {
          // El servidor forzó la desconexión
          this.socket?.connect();
        }
      });

      this.socket.on('error', (error) => {
        console.error('Error en websocket:', error);
      });

    } catch (error) {
      console.error('Error al crear la conexión websocket:', error);
    }
  }

  private handleConnectionError(error: Error) {
    this.reconnectAttempts++;
    console.log(`Intento de reconexión ${this.reconnectAttempts} de ${this.MAX_RECONNECT_ATTEMPTS}`);
    
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.log('Máximo número de intentos de reconexión alcanzado');
      this.disconnect();
      return;
    }

    setTimeout(() => {
      this.reconnect();
    }, 1000 * this.reconnectAttempts);
  }

  private reconnect() {
    console.log('Intentando reconexión...');
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connect();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.reconnectAttempts = 0;
  }

  subscribe(event: string, callback: (data: any) => void) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on(event, callback);
  }

  unsubscribe(event: string, callback: (data: any) => void) {
    this.socket?.off(event, callback);
  }

  emit(event: string, data: any) {
    if (!this.socket?.connected) {
      console.warn('Socket no conectado. Intentando reconexión...');
      this.connect();
    }
    this.socket?.emit(event, data);
  }
}

export default SocketService.getInstance(); 