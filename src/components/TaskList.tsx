import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Task, TaskStatus, taskService } from '../services/taskService';
import TaskDialog from './TaskDialog';
import MainLayout from './layout/MainLayout';
import DraggableTaskList from './DraggableTaskList';

const TaskList: React.FC = () => {
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [openDialog, setOpenDialog] = React.useState(false);
    const [openViewDialog, setOpenViewDialog] = React.useState(false);
    const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
    const [expandedStates, setExpandedStates] = React.useState<Record<string, boolean>>({
        pending: true,
        in_progress: true,
        completed: true
    });

    React.useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const fetchedTasks = await taskService.getAllTasks();
            setTasks(fetchedTasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    };

    const handleTaskMove = async (taskId: number, newStatus: TaskStatus) => {
        const taskToUpdate = tasks.find(t => t.id === taskId);
        if (taskToUpdate) {
            try {
                const updatedTask = await taskService.updateTask(taskId, {
                    ...taskToUpdate,
                    status: newStatus
                });

                setTasks(tasks.map(task => 
                    task.id === updatedTask.id ? updatedTask : task
                ));
            } catch (error) {
                console.error('Error updating task status:', error);
            }
        }
    };

    const handleAddTask = () => {
        setSelectedTask(null);
        setOpenDialog(true);
    };

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);
        setOpenDialog(true);
    };

    const handleViewTask = (task: Task) => {
        console.log('Visualizando tarea:', task);
        setSelectedTask(task);
        setOpenViewDialog(true);
    };

    const handleDeleteTask = async (id: number) => {
        try {
            await taskService.deleteTask(id);
            setTasks(tasks.filter(task => task.id !== id));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleSaveTask = async (taskData: Partial<Task>) => {
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
                
                // Actualizar el estado local con la tarea actualizada
                setTasks(prevTasks => 
                    prevTasks.map(task => 
                        task.id === updatedTask.id ? updatedTask : task
                    )
                );
                // Actualizar la tarea seleccionada
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
    };

    const handleStatusChange = async (newStatus: TaskStatus) => {
        if (selectedTask) {
            try {
                const updatedTask = await taskService.updateTask(selectedTask.id, {
                    ...selectedTask,
                    status: newStatus
                });
                setTasks(tasks.map(task => 
                    task.id === updatedTask.id ? updatedTask : task
                ));
            } catch (error) {
                console.error('Error updating task status:', error);
            }
        }
    };

    const toggleStateExpansion = (stateId: string) => {
        setExpandedStates(prev => ({
            ...prev,
            [stateId]: !prev[stateId]
        }));
    };

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

export default TaskList; 