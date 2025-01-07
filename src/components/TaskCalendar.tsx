import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import { Box, Paper, Typography } from '@mui/material';
import { Task, TaskStatus, taskService } from '../services/taskService';
import MainLayout from './layout/MainLayout';
import TaskDialog from './TaskDialog';
import { getPriorityLabel, getStatusLabel, getPriorityBackgroundColor } from '../utils/taskUtils';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
    'es': es,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const TaskCalendar: React.FC = () => {
    const [tasks, setTasks] = React.useState<any[]>([]);
    const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
    const [dialogOpen, setDialogOpen] = React.useState(false);

    React.useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const start = new Date();
            start.setMonth(start.getMonth() - 1);
            const end = new Date();
            end.setMonth(end.getMonth() + 2);

            const tasksData = await taskService.getTasksByDateRange(
                start.toISOString(),
                end.toISOString()
            );

            const formattedTasks = tasksData.map(task => ({
                id: task.id,
                title: `${task.title} \n${getPriorityLabel(task.priority)} | ${getStatusLabel(task.status)}`,
                start: new Date(task.due_date as string),
                end: new Date(task.due_date as string),
                resource: task
            }));

            setTasks(formattedTasks);
        } catch (error) {
            console.error('Error al cargar las tareas:', error);
        }
    };

    const handleEventClick = (event: any) => {
        setSelectedTask(event.resource);
        setDialogOpen(true);
    };

    const handleStatusChange = async (newStatus: TaskStatus) => {
        if (selectedTask) {
            try {
                await taskService.updateTask(selectedTask.id, { ...selectedTask, status: newStatus });
                await loadTasks();
                setDialogOpen(false);
            } catch (error) {
                console.error('Error al actualizar el estado de la tarea:', error);
            }
        }
    };

    const eventStyleGetter = (event: any) => {
        const task: Task = event.resource;
        return {
            style: {
                backgroundColor: task.status === 'completed' ? '#90EE90' : getPriorityBackgroundColor(task.priority),
                borderRadius: '4px',
                opacity: 1,
                border: 'none',
                display: 'block',
                fontSize: '0.875rem',
                padding: '4px 8px',
                cursor: 'pointer',
                whiteSpace: 'pre-line',
                lineHeight: '1.4',
                color: task.status === 'completed' ? '#333' : '#fff'
            }
        };
    };

    const messages = {
        allDay: 'Todo el día',
        previous: 'Anterior',
        next: 'Siguiente',
        today: 'Hoy',
        month: 'Mes',
        week: 'Semana',
        day: 'Día',
        agenda: 'Agenda',
        date: 'Fecha',
        time: 'Hora',
        event: 'Evento',
        noEventsInRange: 'No hay tareas en este rango',
    };

    return (
        <MainLayout>
            <Box sx={{ height: '100%', p: 0 }}>
                <Paper 
                    elevation={0} 
                    sx={{ 
                        height: '100%', 
                        p: 3,
                        backgroundColor: 'transparent',
                        borderRadius: 2
                    }}
                >
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 4,
                        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                        pb: 2
                    }}>
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                fontWeight: 'bold',
                                color: 'text.primary'
                            }}
                        >
                            Calendario de Tareas
                        </Typography>
                    </Box>
                    <Box sx={{ height: 'calc(100% - 80px)' }}>
                        <Calendar
                            localizer={localizer}
                            events={tasks}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            eventPropGetter={eventStyleGetter}
                            messages={messages}
                            culture="es"
                            views={['month', 'week', 'day', 'agenda']}
                            popup
                            tooltipAccessor={(event) => event.title}
                            onSelectEvent={handleEventClick}
                        />
                    </Box>
                </Paper>
            </Box>
            <TaskDialog
                task={selectedTask}
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onStatusChange={handleStatusChange}
                quickView
            />
        </MainLayout>
    );
};

export default TaskCalendar; 