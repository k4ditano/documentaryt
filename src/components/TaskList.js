import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { taskService } from '../services/taskService';
import TaskDialog from './TaskDialog';
import DraggableTaskList from './DraggableTaskList';
import MainLayout from '../components/layout/MainLayout';
import socketService from '../services/socketService';
const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [expandedStates, setExpandedStates] = useState({
        pending: true,
        in_progress: true,
        completed: true
    });
    const [loading, setLoading] = useState(false);
    const isInitialMount = useRef(true);
    const updateTimeoutRef = useRef();
    const lastUpdateRef = useRef(0);
    const loadTasks = useCallback(async () => {
        const now = Date.now();
        if (loading || (now - lastUpdateRef.current < 5000))
            return;
        try {
            setLoading(true);
            console.log('Cargando tareas...');
            const fetchedTasks = await taskService.getAllTasks();
            console.log('Tareas cargadas:', fetchedTasks);
            setTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []);
            lastUpdateRef.current = now;
        }
        catch (error) {
            console.error('Error al cargar las tareas:', error);
            setTasks([]);
        }
        finally {
            setLoading(false);
        }
    }, [loading]);
    useEffect(() => {
        if (isInitialMount.current) {
            loadTasks();
            isInitialMount.current = false;
        }
    }, [loadTasks]);
    useEffect(() => {
        const handleTaskUpdate = (updatedTask) => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
            updateTimeoutRef.current = setTimeout(() => {
                setTasks(prevTasks => {
                    const taskExists = prevTasks.some(task => task.id === updatedTask.id);
                    if (!taskExists)
                        return prevTasks;
                    return prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task);
                });
            }, 300);
        };
        const handleTaskCreate = (newTask) => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
            updateTimeoutRef.current = setTimeout(() => {
                setTasks(prevTasks => {
                    const taskExists = prevTasks.some(task => task.id === newTask.id);
                    if (taskExists)
                        return prevTasks;
                    return [...prevTasks, newTask];
                });
            }, 300);
        };
        const handleTaskDelete = (taskId) => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
            updateTimeoutRef.current = setTimeout(() => {
                setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
            }, 300);
        };
        socketService.on('task:update', handleTaskUpdate);
        socketService.on('task:create', handleTaskCreate);
        socketService.on('task:delete', handleTaskDelete);
        return () => {
            socketService.off('task:update', handleTaskUpdate);
            socketService.off('task:create', handleTaskCreate);
            socketService.off('task:delete', handleTaskDelete);
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, []);
    const handleTaskMove = useCallback(async (taskId, newStatus) => {
        try {
            const taskToUpdate = tasks.find(t => t.id === taskId);
            if (!taskToUpdate) {
                console.error('Tarea no encontrada:', taskId);
                return;
            }
            const updatedTask = await taskService.updateTask(taskId, {
                ...taskToUpdate,
                status: newStatus
            });
            setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
        }
        catch (error) {
            console.error('Error al actualizar el estado de la tarea:', error);
        }
    }, [tasks]);
    const handleAddTask = useCallback(() => {
        setSelectedTask(null);
        setOpenDialog(true);
    }, []);
    const handleEditTask = useCallback((task) => {
        setSelectedTask(task);
        setOpenDialog(true);
    }, []);
    const handleViewTask = useCallback((task) => {
        console.log('Visualizando tarea:', task);
        setSelectedTask(task);
        setOpenViewDialog(true);
    }, []);
    const handleDeleteTask = useCallback(async (id) => {
        try {
            await taskService.deleteTask(id);
            setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
        }
        catch (error) {
            console.error('Error deleting task:', error);
        }
    }, []);
    const handleSaveTask = useCallback(async (taskData) => {
        try {
            console.log('Guardando tarea con datos:', taskData);
            if (selectedTask) {
                const linkedPages = Array.isArray(taskData.linked_pages) ? taskData.linked_pages :
                    (Array.isArray(selectedTask.linked_pages) ? selectedTask.linked_pages : []);
                const updatedTask = await taskService.updateTask(selectedTask.id, {
                    ...selectedTask,
                    ...taskData,
                    linked_pages: linkedPages
                });
                console.log('Tarea actualizada:', updatedTask);
                setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
                setSelectedTask(updatedTask);
            }
            else {
                const newTask = await taskService.createTask({
                    ...taskData,
                    linked_pages: Array.isArray(taskData.linked_pages) ? taskData.linked_pages : []
                });
                console.log('Nueva tarea creada:', newTask);
                setTasks(prevTasks => [...prevTasks, newTask]);
            }
            setOpenDialog(false);
        }
        catch (error) {
            console.error('Error saving task:', error);
        }
    }, [selectedTask]);
    const handleStatusChange = useCallback(async (newStatus) => {
        if (selectedTask) {
            try {
                const updatedTask = await taskService.updateTask(selectedTask.id, {
                    ...selectedTask,
                    status: newStatus
                });
                setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
            }
            catch (error) {
                console.error('Error updating task status:', error);
            }
        }
    }, [selectedTask]);
    const toggleStateExpansion = useCallback((stateId) => {
        setExpandedStates(prev => ({
            ...prev,
            [stateId]: !prev[stateId]
        }));
    }, []);
    return (_jsx(MainLayout, { children: _jsxs(Box, { sx: { p: 3, mt: { xs: 0, md: 4 } }, children: [_jsxs(Box, { sx: {
                        mb: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'relative',
                        zIndex: 1
                    }, children: [_jsx(Typography, { variant: "h4", component: "h1", sx: { color: 'rgb(55, 53, 47)' }, children: "Tareas" }), _jsx(Button, { startIcon: _jsx(AddIcon, { sx: { fontSize: 20 } }), onClick: handleAddTask, sx: {
                                color: 'rgb(55, 53, 47)',
                                backgroundColor: 'transparent',
                                textTransform: 'none',
                                fontSize: '14px',
                                padding: '6px 12px',
                                '&:hover': {
                                    backgroundColor: 'rgba(55, 53, 47, 0.08)'
                                }
                            }, children: "Nueva tarea" })] }), _jsx(DraggableTaskList, { tasks: tasks, onTaskMove: handleTaskMove, onEditTask: handleEditTask, onDeleteTask: handleDeleteTask, onViewTask: handleViewTask, expandedStates: expandedStates, onToggleState: toggleStateExpansion }), _jsx(TaskDialog, { open: openDialog, onClose: () => setOpenDialog(false), onSave: handleSaveTask, task: selectedTask }), _jsx(TaskDialog, { open: openViewDialog, onClose: () => setOpenViewDialog(false), task: selectedTask, onStatusChange: handleStatusChange, quickView: true })] }) }));
};
export default React.memo(TaskList);
