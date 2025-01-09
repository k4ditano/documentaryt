import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Task, TaskStatus } from '../services/taskService';
import { taskService } from '../services/taskService';
import TaskDialog from './TaskDialog';
import DraggableTaskList from './DraggableTaskList';
import MainLayout from '../components/layout/MainLayout';
import socketService from '../services/socketService';

const DEBOUNCE_TIME = 5000; // 5 segundos entre actualizaciones
const LOAD_DEBOUNCE = 10000; // 10 segundos entre cargas

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
    const lastUpdateRef = useRef<number>(0);
    const tasksRef = useRef<Task[]>([]);
    const pendingUpdatesRef = useRef<Set<number>>(new Set());
    const socketHandlersRef = useRef({
        handleTaskUpdate: null as ((updatedTask: Task) => void) | null,
        handleTaskCreate: null as ((newTask: Task) => void) | null,
        handleTaskDelete: null as ((taskId: number) => void) | null
    });

    useEffect(() => {
        tasksRef.current = tasks;
    }, [tasks]);

    const loadTasks = useCallback(async () => {
        const now = Date.now();
        if (now - lastUpdateRef.current < LOAD_DEBOUNCE) {
            console.log('Ignorando carga de tareas, muy pronto desde la última actualización');
            return;
        }
        
        try {
            setLoading(true);
            console.log('Cargando tareas...');
            const fetchedTasks = await taskService.getAllTasks();
            
            const currentTasks = tasksRef.current;
            const newTasks = Array.isArray(fetchedTasks) ? fetchedTasks : [];
            
            // Solo actualizar si hay cambios significativos
            const hasSignificantChanges = newTasks.length !== currentTasks.length || 
                                        newTasks.some((task, index) => {
                                            const currentTask = currentTasks[index];
                                            if (!currentTask) return true;
                                            
                                            // Comparar solo campos relevantes
                                            return task.id !== currentTask.id ||
                                                   task.status !== currentTask.status ||
                                                   task.title !== currentTask.title ||
                                                   task.priority !== currentTask.priority;
                                        });
            
            if (hasSignificantChanges) {
                console.log('Actualizando tareas debido a cambios significativos');
                setTasks(newTasks);
            } else {
                console.log('No hay cambios significativos en las tareas');
            }
            
            lastUpdateRef.current = now;
            pendingUpdatesRef.current.clear();
        } catch (error) {
            console.error('Error al cargar las tareas:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isInitialMount.current) {
            loadTasks();
            isInitialMount.current = false;
        }
    }, [loadTasks]);

    const processUpdates = useCallback(() => {
        if (pendingUpdatesRef.current.size > 0) {
            console.log('Procesando actualizaciones pendientes');
            loadTasks();
        }
    }, [loadTasks]);

    useEffect(() => {
        let isMounted = true;
        
        const handleTaskUpdate = (updatedTask: Task) => {
            if (!isMounted) return;
            
            console.log('Recibida actualización de tarea:', updatedTask.id);
            pendingUpdatesRef.current.add(updatedTask.id);
            
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
            
            updateTimeoutRef.current = setTimeout(processUpdates, DEBOUNCE_TIME);
        };

        const handleTaskCreate = (newTask: Task) => {
            if (!isMounted) return;
            
            console.log('Recibida nueva tarea:', newTask.id);
            pendingUpdatesRef.current.add(newTask.id);
            
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
            
            updateTimeoutRef.current = setTimeout(processUpdates, DEBOUNCE_TIME);
        };

        const handleTaskDelete = (taskId: number) => {
            if (!isMounted) return;
            
            console.log('Recibida eliminación de tarea:', taskId);
            pendingUpdatesRef.current.add(taskId);
            
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
            
            updateTimeoutRef.current = setTimeout(processUpdates, DEBOUNCE_TIME);
        };

        socketHandlersRef.current = {
            handleTaskUpdate,
            handleTaskCreate,
            handleTaskDelete
        };

        socketService.on('task:update', handleTaskUpdate);
        socketService.on('task:create', handleTaskCreate);
        socketService.on('task:delete', handleTaskDelete);

        return () => {
            isMounted = false;
            
            if (socketHandlersRef.current.handleTaskUpdate) {
                socketService.off('task:update', socketHandlersRef.current.handleTaskUpdate);
            }
            if (socketHandlersRef.current.handleTaskCreate) {
                socketService.off('task:create', socketHandlersRef.current.handleTaskCreate);
            }
            if (socketHandlersRef.current.handleTaskDelete) {
                socketService.off('task:delete', socketHandlersRef.current.handleTaskDelete);
            }
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, [processUpdates]);

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