import { usePolling } from './usePolling';
import axios from 'axios';
export function useFolders() {
    const fetchFolders = async () => {
        const response = await axios.get('/api/folders');
        return response.data;
    };
    return usePolling(fetchFolders, 'folders', {
        interval: 30000, // 30 segundos
        cacheTime: 5000 // 5 segundos de caché
    });
}
