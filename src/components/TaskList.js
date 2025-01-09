import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { taskService } from '../services/taskService';
import TaskDialog from './TaskDialog';
import DraggableTaskList from './DraggableTaskList';
import MainLayout from '../components/layout/MainLayout';

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
    const pollingIntervalRef = useRef(null);
    const lastUpdateRef = useRef(0);

    const loadTasks = useCallback(async () => {
        const now = Date.now();
        if (loading || (now - lastUpdateRef.current < 5000)) return;
        
        try {
            setLoading(true);
            console.log('Cargando tareas...');
            const fetchedTasks = await taskService.getAllTasks();
            console.log('Tareas cargadas:', fetchedTasks);
            setTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []);
            lastUpdateRef.current = now;
        } catch (error) {
            console.error('Error al cargar las tareas:', error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, [loading]);

    // Iniciar polling al montar el componente
    useEffect(() => {
        loadTasks();
        
        // Configurar polling cada 10 segundos
        pollingIntervalRef.current = setInterval(() => {
            loadTasks();
        }, 10000);

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [loadTasks]);

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
            // Forzar una actualización después de un cambio
            setTimeout(loadTasks, 1000);
        } catch (error) {
            console.error('Error al actualizar el estado de la tarea:', error);
        }
    }, [tasks, loadTasks]);

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
            // Forzar una actualización después de eliminar
            setTimeout(loadTasks, 1000);
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }, [loadTasks]);

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
            } else {
                const newTask = await taskService.createTask({
                    ...taskData,
                    linked_pages: Array.isArray(taskData.linked_pages) ? taskData.linked_pages : []
                });
                console.log('Nueva tarea creada:', newTask);
                setTasks(prevTasks => [...prevTasks, newTask]);
            }
            setOpenDialog(false);
            // Forzar una actualización después de guardar
            setTimeout(loadTasks, 1000);
        } catch (error) {
            console.error('Error saving task:', error);
        }
    }, [selectedTask, loadTasks]);

    const handleStatusChange = useCallback(async (newStatus) => {
        if (selectedTask) {
            try {
                const updatedTask = await taskService.updateTask(selectedTask.id, {
                    ...selectedTask,
                    status: newStatus
                });
                setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
                // Forzar una actualización después de cambiar el estado
                setTimeout(loadTasks, 1000);
            } catch (error) {
                console.error('Error updating task status:', error);
            }
        }
    }, [selectedTask, loadTasks]);

    const toggleStateExpansion = useCallback((stateId) => {
        setExpandedStates(prev => ({
            ...prev,
            [stateId]: !prev[stateId]
        }));
    }, []);

    return (
        <MainLayout>
            <Box sx={{ p: 3, mt: { xs: 0, md: 4 } }}>
                <Box sx={{
                    mb: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <Typography variant="h4" component="h1" sx={{ color: 'rgb(55, 53, 47)' }}>
                        Tareas
                    </Typography>
                    <Button
                        startIcon={<AddIcon sx={{ fontSize: 20 }} />}
                        onClick={handleAddTask}
                        sx={{
                            color: 'rgb(55, 53, 47)',
                            backgroundColor: 'transparent',
                            textTransform: 'none',
                            fontSize: '14px',
                            padding: '6px 12px',
                            '&:hover': {
                                backgroundColor: 'rgba(55, 53, 47, 0.08)'
                            }
                        }}
                    >
                        Nueva tarea
                    </Button>
                </Box>

                <DraggableTaskList
                    tasks={tasks}
                    onTaskMove={handleTaskMove}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onViewTask={handleViewTask}
                    expandedStates={expandedStates}
                    onToggleState={toggleStateExpansion}
                />

                <TaskDialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    onSave={handleSaveTask}
                    task={selectedTask}
                />

                <TaskDialog
                    open={openViewDialog}
                    onClose={() => setOpenViewDialog(false)}
                    task={selectedTask}
                    onStatusChange={handleStatusChange}
                    quickView
                />
            </Box>
        </MainLayout>
    );
};

export default React.memo(TaskList);
