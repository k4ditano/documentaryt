import React, { useState, useEffect } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Typography,
    Button,
    Divider,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Reminder, reminderService } from '../services/reminderService';
import ReminderDialog from './ReminderDialog';
import MainLayout from './layout/MainLayout';

const ReminderList: React.FC = () => {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        loadReminders();
    }, []);

    const loadReminders = async () => {
        try {
            const data = await reminderService.getReminders();
            setReminders(data);
        } catch (error) {
            console.error('Error al cargar los recordatorios:', error);
        }
    };

    const handleCreateReminder = async (data: { 
        title: string; 
        message?: string; 
        reminderTime: Date;
    }) => {
        try {
            await reminderService.createReminder(data);
            await loadReminders();
        } catch (error) {
            console.error('Error al crear el recordatorio:', error);
        }
    };

    const handleCancelReminder = async (id: number) => {
        try {
            await reminderService.cancelReminder(id);
            await loadReminders();
        } catch (error) {
            console.error('Error al cancelar el recordatorio:', error);
        }
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
                        Recordatorios
                    </Typography>
                    <Button
                        startIcon={<AddIcon sx={{ fontSize: 20 }} />}
                        onClick={() => setIsDialogOpen(true)}
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
                        Nuevo recordatorio
                    </Button>
                </Box>

                <List sx={{ 
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}>
                    {reminders.length === 0 ? (
                        <ListItem>
                            <ListItemText
                                primary={
                                    <Typography align="center" color="text.secondary">
                                        No hay recordatorios pendientes
                                    </Typography>
                                }
                            />
                        </ListItem>
                    ) : (
                        reminders.map((reminder) => (
                            <ListItem
                                key={reminder.id}
                                sx={{
                                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                                    '&:last-child': {
                                        borderBottom: 'none'
                                    },
                                    '&:hover': {
                                        bgcolor: 'rgba(55, 53, 47, 0.04)'
                                    }
                                }}
                                secondaryAction={
                                    <IconButton
                                        edge="end"
                                        onClick={() => handleCancelReminder(reminder.id)}
                                        sx={{ 
                                            color: 'rgb(55, 53, 47)',
                                            opacity: 0.6,
                                            '&:hover': {
                                                opacity: 1,
                                                backgroundColor: 'rgba(55, 53, 47, 0.08)'
                                            }
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                }
                            >
                                <ListItemText
                                    primary={
                                        <Typography 
                                            variant="subtitle1" 
                                            sx={{ 
                                                fontWeight: 500,
                                                color: 'rgb(55, 53, 47)'
                                            }}
                                        >
                                            {reminder.title}
                                        </Typography>
                                    }
                                    secondary={
                                        <Box>
                                            {reminder.message && (
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        mb: 0.5,
                                                        color: 'rgba(55, 53, 47, 0.65)'
                                                    }}
                                                >
                                                    {reminder.message}
                                                </Typography>
                                            )}
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    display: 'block',
                                                    fontSize: isMobile ? '0.75rem' : '0.7rem',
                                                    color: 'rgba(55, 53, 47, 0.5)'
                                                }}
                                            >
                                                Programado para: {new Date(reminder.reminder_time).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))
                    )}
                </List>

                <ReminderDialog
                    open={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    onSubmit={handleCreateReminder}
                />
            </Box>
        </MainLayout>
    );
};

export default ReminderList; 