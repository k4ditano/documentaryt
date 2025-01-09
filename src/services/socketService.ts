import io, { Socket } from 'socket.io-client';
import { getToken } from './authService';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;

  connect() {
    if (this.socket || this.isConnecting) return;

    const token = getToken();
    if (!token) {
      console.error('No se puede conectar al websocket: Token no encontrado');
      return;
    }

    try {
      this.isConnecting = true;
      const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '') || '';
      console.log('Conectando a websocket en:', baseUrl);

      this.socket = io(baseUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: false,
        timeout: 30000,
        path: '/socket.io/',
        autoConnect: false
      });

      this.setupEventHandlers();
      this.socket.connect();
    } catch (error) {
      console.error('Error al configurar el socket:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Conectado al servidor de websockets');
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión websocket:', error);
      this.isConnecting = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Máximo número de intentos de reconexión alcanzado');
        this.disconnect();
      } else {
        this.scheduleReconnect();
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Desconectado del servidor de websockets. Razón:', reason);
      this.isConnecting = false;
      
      if (reason === 'io server disconnect' || reason === 'transport close') {
        console.log('Reconectando por desconexión del servidor...');
        this.scheduleReconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('Error de websocket:', error);
      this.isConnecting = false;
      if (error.toString().includes('auth') || error.toString().includes('timeout')) {
        this.scheduleReconnect();
      }
    });
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || this.isConnecting) {
      return;
    }
    
    this.reconnectTimer = setTimeout(() => {
      if (!this.isConnecting) {
        console.log('Intentando reconectar...');
        this.disconnect();
        this.connect();
      }
    }, 5000);
  }

  disconnect() {
    this.isConnecting = false;
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket && !this.isConnecting) {
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
    if (!this.socket && !this.isConnecting) {
      console.warn('Intentando emitir evento sin conexión socket:', event);
      this.connect();
    }
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export default new SocketService(); 