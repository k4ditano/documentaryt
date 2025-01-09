import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import socketService from '../services/socketService';
export const useTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const updateTimeoutRef = useRef(null);
    const lastUpdateRef = useRef(0);
    const debounceTime = 5000; // 5 segundos de debounce
    const fetchTasks = useCallback(async () => {
        const now = Date.now();
        if (!isInitialLoad && !loading && (now - lastUpdateRef.current < debounceTime)) {
            console.log('Omitiendo actualización por debounce');
            return;
        }
        try {
            setLoading(true);
            setError(null);
            console.log('Solicitando tareas...');
            const response = await axios.get('/api/tasks');
            console.log('Tareas recibidas:', response.data.length);
            setTasks(response.data);
            setIsInitialLoad(false);
            lastUpdateRef.current = now;
        }
        catch (err) {
            setError('Error al cargar las tareas');
            console.error('Error fetching tasks:', err);
        }
        finally {
            setLoading(false);
        }
    }, [isInitialLoad, loading]);
    useEffect(() => {
        fetchTasks();
        // Suscribirse a actualizaciones via websocket
        const handleUpdate = (data) => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
            updateTimeoutRef.current = setTimeout(() => {
                console.log('Actualizando tarea:', data.id);
                setTasks(prev => prev.map(t => t.id === data.id ? data : t));
            }, debounceTime);
        };
        const handleCreate = (data) => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
            updateTimeoutRef.current = setTimeout(() => {
                console.log('Nueva tarea creada:', data.id);
                setTasks(prev => {
                    const exists = prev.some(t => t.id === data.id);
                    if (exists)
                        return prev;
                    return [...prev, data];
                });
            }, debounceTime);
        };
        const handleDelete = (id) => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
            updateTimeoutRef.current = setTimeout(() => {
                console.log('Eliminando tarea:', id);
                setTasks(prev => prev.filter(t => t.id !== id));
            }, debounceTime);
        };
        socketService.on('task:update', handleUpdate);
        socketService.on('task:create', handleCreate);
        socketService.on('task:delete', handleDelete);
        return () => {
            socketService.off('task:update', handleUpdate);
            socketService.off('task:create', handleCreate);
            socketService.off('task:delete', handleDelete);
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, []);
    const createTask = async (task) => {
        try {
            const response = await axios.post('/api/tasks', task);
            return response.data;
        }
        catch (err) {
            console.error('Error creating task:', err);
            throw err;
        }
    };
    const updateTask = async (id, task) => {
        try {
            const response = await axios.put(`/api/tasks/${id}`, task);
            return response.data;
        }
        catch (err) {
            console.error('Error updating task:', err);
            throw err;
        }
    };
    const deleteTask = async (id) => {
        try {
            await axios.delete(`/api/tasks/${id}`);
        }
        catch (err) {
            console.error('Error deleting task:', err);
            throw err;
        }
    };
    return {
        tasks,
        loading,
        error,
        refreshTasks: fetchTasks,
        createTask,
        updateTask,
        deleteTask
    };
};
