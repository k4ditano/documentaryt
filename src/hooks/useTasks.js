import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import socketService from '../services/socketService';
export const useTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const fetchTasks = useCallback(async () => {
        if (!isInitialLoad && !loading)
            return; // Solo cargar en el montaje inicial o cuando se solicite explícitamente
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('/api/tasks');
            setTasks(response.data);
            setIsInitialLoad(false);
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
            setTasks(prev => prev.map(t => t.id === data.id ? data : t));
        };
        const handleCreate = (data) => {
            setTasks(prev => [...prev, data]);
        };
        const handleDelete = (id) => {
            setTasks(prev => prev.filter(t => t.id !== id));
        };
        socketService.on('task:update', handleUpdate);
        socketService.on('task:create', handleCreate);
        socketService.on('task:delete', handleDelete);
        return () => {
            socketService.off('task:update', handleUpdate);
            socketService.off('task:create', handleCreate);
            socketService.off('task:delete', handleDelete);
        };
    }, [fetchTasks]);
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
