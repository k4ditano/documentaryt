import { useState, useEffect, useCallback, useRef } from 'react';
import socketService from '../services/socketService';
const cache = new Map();
export function usePolling(fetchFn, key, options = {}) {
    const { interval = 300000, // 5 minutos por defecto
    immediate = true, cacheTime = 60000 // 1 minuto de caché
     } = options;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const timeoutRef = useRef();
    const isInitialMount = useRef(true);
    const fetchData = useCallback(async (force = false) => {
        const now = Date.now();
        const cachedData = cache.get(key);
        // Si hay datos en caché y no ha expirado, usarlos
        if (!force && cachedData && now - cachedData.timestamp < cacheTime) {
            setData(cachedData.data);
            return;
        }
        // No realizar la petición si ya hay una en curso
        if (loading)
            return;
        try {
            setLoading(true);
            const result = await fetchFn();
            setData(result);
            cache.set(key, { data: result, timestamp: now });
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error('Error al obtener datos'));
            // Si hay error, mantener los datos anteriores del caché si existen
            if (cachedData) {
                setData(cachedData.data);
            }
        }
        finally {
            setLoading(false);
        }
    }, [fetchFn, key, cacheTime, loading]);
    useEffect(() => {
        // Solo hacer el fetch inicial si immediate es true
        if (immediate || !isInitialMount.current) {
            fetchData();
        }
        isInitialMount.current = false;
        // Suscribirse a actualizaciones vía websocket
        const handleUpdate = () => {
            fetchData(true); // Forzar actualización al recibir evento
        };
        socketService.on(`update:${key}`, handleUpdate);
        // Configurar polling con intervalo
        if (interval > 0) {
            timeoutRef.current = setInterval(() => {
                fetchData();
            }, interval);
        }
        return () => {
            if (timeoutRef.current) {
                clearInterval(timeoutRef.current);
            }
            socketService.off(`update:${key}`, handleUpdate);
        };
    }, [fetchData, immediate, interval, key]);
    return {
        data,
        loading,
        error,
        refetch: () => fetchData(true),
        clearCache: () => cache.delete(key)
    };
}
