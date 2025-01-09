import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
export const useWebSocket = () => {
    const socketRef = useRef(null);
    useEffect(() => {
        // Conectar al servidor WebSocket
        const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
            transports: ['websocket'],
            autoConnect: true,
        });
        socket.on('connect', () => {
            console.log('WebSocket conectado');
        });
        socket.on('disconnect', () => {
            console.log('WebSocket desconectado');
        });
        socket.on('error', (error) => {
            console.error('Error de WebSocket:', error);
        });
        socketRef.current = socket;
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);
    return { socket: socketRef.current };
};
