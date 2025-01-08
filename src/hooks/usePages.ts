import { usePolling } from './usePolling';
import axios from 'axios';
import type { Page } from '../types';

export function usePages() {
  const fetchPages = async () => {
    const response = await axios.get<Page[]>('/pages');
    return response.data;
  };

  return usePolling(fetchPages, 'pages', {
    interval: 30000, // 30 segundos
    cacheTime: 5000  // 5 segundos de caché
  });
} 