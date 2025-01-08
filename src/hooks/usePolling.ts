import { useState, useEffect, useCallback, useRef } from 'react';
import socketService from '../services/socketService';

interface PollingOptions {
  interval?: number;
  immediate?: boolean;
  cacheTime?: number;
}

interface CacheData<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheData<any>>();

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  key: string,
  options: PollingOptions = {}
) {
  const {
    interval = 30000, // 30 segundos por defecto
    immediate = true,
    cacheTime = 5000 // 5 segundos de caché
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const fetchData = useCallback(async (force = false) => {
    const now = Date.now();
    const cachedData = cache.get(key);

    // Si hay datos en caché y no ha expirado, usarlos
    if (!force && cachedData && now - cachedData.timestamp < cacheTime) {
      setData(cachedData.data);
      return;
    }

    try {
      setLoading(true);
      const result = await fetchFn();
      setData(result);
      cache.set(key, { data: result, timestamp: now });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al obtener datos'));
    } finally {
      setLoading(false);
    }
  }, [fetchFn, key, cacheTime]);

  useEffect(() => {
    // Suscribirse a actualizaciones vía websocket
    socketService.subscribe(`update:${key}`, () => {
      fetchData(true); // Forzar actualización al recibir evento
    });

    if (immediate) {
      fetchData();
    }

    // Configurar polling con intervalo
    timeoutRef.current = setInterval(() => {
      fetchData();
    }, interval);

    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
      socketService.unsubscribe(`update:${key}`, () => {});
    };
  }, [fetchData, immediate, interval, key]);

  return { data, loading, error, refetch: () => fetchData(true) };
} 