import { usePolling } from './usePolling';
import axios from 'axios';
export function usePages() {
    const fetchPages = async () => {
        const response = await axios.get('/api/pages');
        return response.data;
    };
    return usePolling(fetchPages, 'pages', {
        interval: 30000, // 30 segundos
        cacheTime: 5000 // 5 segundos de caché
    });
}
