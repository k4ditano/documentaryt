import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import socketService from '../services/socketService';
const AppContext = createContext({
    pages: [],
    folders: [],
    tasks: [],
    loading: false,
    error: null,
    refreshData: async () => { },
    refreshPages: async () => { },
    refreshFolders: async () => { },
    createPage: async () => ({ id: '', title: '', content: '', parent_id: null, created_at: '', updated_at: '', user_id: 0 }),
    updatePage: async () => ({ id: '', title: '', content: '', parent_id: null, created_at: '', updated_at: '', user_id: 0 }),
    deletePage: async () => { },
    createFolder: async () => ({ id: '', name: '', parent_id: null, created_at: '', updated_at: '', user_id: 0 }),
    updateFolder: async () => ({ id: '', name: '', parent_id: null, created_at: '', updated_at: '', user_id: 0 }),
    deleteFolder: async () => { },
});
export const useApp = () => useContext(AppContext);
export const AppProvider = ({ children }) => {
    const [pages, setPages] = useState([]);
    const [folders, setFolders] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [pagesRes, foldersRes, tasksRes] = await Promise.all([
                axios.get('/api/pages'),
                axios.get('/api/folders'),
                axios.get('/api/tasks')
            ]);
            setPages(Array.isArray(pagesRes.data) ? pagesRes.data : []);
            setFolders(Array.isArray(foldersRes.data) ? foldersRes.data : []);
            setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
        }
        catch (err) {
            console.error('Error al cargar los datos:', err);
            setError(err.message || 'Error al cargar los datos');
        }
        finally {
            setLoading(false);
        }
    }, []);
    const refreshPages = async () => {
        try {
            const response = await axios.get('/api/pages');
            setPages(Array.isArray(response.data) ? response.data : []);
        }
        catch (err) {
            console.error('Error al recargar páginas:', err);
        }
    };
    const refreshFolders = async () => {
        try {
            const response = await axios.get('/api/folders');
            setFolders(Array.isArray(response.data) ? response.data : []);
        }
        catch (err) {
            console.error('Error al recargar carpetas:', err);
        }
    };
    const createPage = async (page) => {
        const response = await axios.post('/api/pages', page);
        await refreshPages();
        return response.data;
    };
    const updatePage = async (id, page) => {
        const response = await axios.put(`/api/pages/${id}`, page);
        await refreshPages();
        return response.data;
    };
    const deletePage = async (id) => {
        await axios.delete(`/api/pages/${id}`);
        await refreshPages();
    };
    const createFolder = async (folder) => {
        const response = await axios.post('/api/folders', folder);
        await refreshFolders();
        return response.data;
    };
    const updateFolder = async (id, folder) => {
        const response = await axios.put(`/api/folders/${id}`, folder);
        await refreshFolders();
        return response.data;
    };
    const deleteFolder = async (id) => {
        await axios.delete(`/api/folders/${id}`);
        await refreshFolders();
    };
    useEffect(() => {
        fetchData();
        // Suscribirse a actualizaciones en tiempo real
        const handlePageUpdate = () => refreshPages();
        const handleFolderUpdate = () => refreshFolders();
        socketService.on('pageUpdated', handlePageUpdate);
        socketService.on('folderUpdated', handleFolderUpdate);
        return () => {
            socketService.off('pageUpdated', handlePageUpdate);
            socketService.off('folderUpdated', handleFolderUpdate);
        };
    }, [fetchData]);
    return (_jsx(AppContext.Provider, { value: {
            pages,
            folders,
            tasks,
            loading,
            error,
            refreshData: fetchData,
            refreshPages,
            refreshFolders,
            createPage,
            updatePage,
            deletePage,
            createFolder,
            updateFolder,
            deleteFolder,
        }, children: children }));
};
