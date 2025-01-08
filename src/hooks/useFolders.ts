import { usePolling } from './usePolling';
import axios from 'axios';
import type { Folder } from '../types';

export function useFolders() {
  const fetchFolders = async () => {
    const response = await axios.get<Folder[]>('/folders');
    return response.data;
  };

  return usePolling(fetchFolders, 'folders', {
    interval: 30000, // 30 segundos
    cacheTime: 5000  // 5 segundos de caché
  });
} 