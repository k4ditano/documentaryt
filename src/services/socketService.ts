import io, { Socket } from 'socket.io-client';
import { getToken } from './authService';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket) return;

    const token = getToken();
    if (!token) return;

    this.socket = io(import.meta.env.VITE_API_URL || '', {
      auth: {
        token
      }
    });

    this.socket.on('connect', () => {
      console.log('Conectado al servidor de websockets');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Desconectado del servidor de websockets. Razón:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('Error de websocket:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export default new SocketService(); 