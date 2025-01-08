import { io, Socket } from 'socket.io-client';
import { getToken } from './authService';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

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
    if (!token) return;

    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Conectado al servidor de websockets');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión:', error);
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del servidor de websockets');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(event: string, callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  unsubscribe(event: string, callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }
}

export default SocketService.getInstance(); 