import io, { Socket } from 'socket.io-client';
import { getToken } from './authService';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    if (this.socket) return;

    const token = getToken();
    if (!token) {
      console.error('No se puede conectar al websocket: Token no encontrado');
      return;
    }

    const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '') || '';
    console.log('Conectando a websocket en:', baseUrl);

    this.socket = io(baseUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 10000,
      path: '/socket.io/'
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Conectado al servidor de websockets');
      this.reconnectAttempts = 0;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión websocket:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Máximo número de intentos de reconexión alcanzado');
        this.disconnect();
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Desconectado del servidor de websockets. Razón:', reason);
      if (reason === 'io server disconnect') {
        // El servidor forzó la desconexión
        console.log('Reconectando por desconexión del servidor...');
        this.connect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('Error de websocket:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) {
      console.warn('Intentando suscribirse a evento sin conexión socket:', event);
      this.connect();
    }
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
    if (!this.socket) {
      console.warn('Intentando emitir evento sin conexión socket:', event);
      this.connect();
    }
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export default new SocketService(); 