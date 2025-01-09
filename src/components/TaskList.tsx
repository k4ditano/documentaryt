import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Task, TaskStatus } from '../services/taskService';
import { taskService } from '../services/taskService';
import TaskDialog from './TaskDialog';
import DraggableTaskList from './DraggableTaskList';
import MainLayout from '../components/layout/MainLayout';
import socketService from '../services/socketService';

const TaskList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({
        pending: true,
        in_progress: true,
        completed: true
    });
    const [loading, setLoading] = useState(false);
    const isInitialMount = useRef(true);
    const updateTimeoutRef = useRef<NodeJS.Timeout>();

    const loadTasks = useCallback(async () => {
        if (loading) return;
        
        try {
            setLoading(true);
            console.log('Cargando tareas...');
            const fetchedTasks = await taskService.getAllTasks();
            console.log('Tareas cargadas:', fetchedTasks);
            setTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []);
        } catch (error) {
            console.error('Error al cargar las tareas:', error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, [loading]);

    useEffect(() => {
        if (isInitialMount.current) {
            loadTasks();
            isInitialMount.current = false;
            return;
        }
    }, [loadTasks]);

    useEffect(() => {
        // Suscribirse a eventos de websocket
        const handleTaskUpdate = (updatedTask: Task) => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
            
            updateTimeoutRef.current = setTimeout(() => {
                setTasks(prevTasks => 
                    prevTasks.map(task => 
                        task.id === updatedTask.id ? updatedTask : task
                    )
                );
            }, 300);
        };

        const handleTaskCreate = (newTask: Task) => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
            
            updateTimeoutRef.current = setTimeout(() => {
                setTasks(prevTasks => [...prevTasks, newTask]);
            }, 300);
        };

        const handleTaskDelete = (taskId: number) => {
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

    const handleTaskMove = useCallback(async (taskId: number, newStatus: TaskStatus) => {
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

            setTasks(prevTasks => 
                prevTasks.map(task => 
                    task.id === updatedTask.id ? updatedTask : task
                )
            );
        } catch (error) {
            console.error('Error al actualizar el estado de la tarea:', error);
        }
    }, [tasks]);

    const handleAddTask = useCallback(() => {
        setSelectedTask(null);
        setOpenDialog(true);
    }, []);

    const handleEditTask = useCallback((task: Task) => {
        setSelectedTask(task);
        setOpenDialog(true);
    }, []);

    const handleViewTask = useCallback((task: Task) => {
        console.log('Visualizando tarea:', task);
        setSelectedTask(task);
        setOpenViewDialog(true);
    }, []);

    const handleDeleteTask = useCallback(async (id: number) => {
        try {
            await taskService.deleteTask(id);
            setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }, []);

    const handleSaveTask = useCallback(async (taskData: Partial<Task>) => {
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
                
                setTasks(prevTasks => 
                    prevTasks.map(task => 
                        task.id === updatedTask.id ? updatedTask : task
                    )
                );
                setSelectedTask(updatedTask);
            } else {
                const newTask = await taskService.createTask({
                    ...taskData,
                    linked_pages: Array.isArray(taskData.linked_pages) ? taskData.linked_pages : []
                } as Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>);
                console.log('Nueva tarea creada:', newTask);
                setTasks(prevTasks => [...prevTasks, newTask]);
            }
            setOpenDialog(false);
        } catch (error) {
            console.error('Error saving task:', error);
        }
    }, [selectedTask]);

    const handleStatusChange = useCallback(async (newStatus: TaskStatus) => {
        if (selectedTask) {
            try {
                const updatedTask = await taskService.updateTask(selectedTask.id, {
                    ...selectedTask,
                    status: newStatus
                });
                setTasks(prevTasks => prevTasks.map(task => 
                    task.id === updatedTask.id ? updatedTask : task
                ));
            } catch (error) {
                console.error('Error updating task status:', error);
            }
        }
    }, [selectedTask]);

    const toggleStateExpansion = useCallback((stateId: string) => {
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
}

export default React.memo(TaskList); 