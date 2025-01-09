import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemText, IconButton, Typography, Button, useTheme, useMediaQuery, } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { reminderService } from '../services/reminderService';
import ReminderDialog from './ReminderDialog';
import MainLayout from './layout/MainLayout';
const ReminderList = () => {
    const [reminders, setReminders] = useState([]);
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
        }
        catch (error) {
            console.error('Error al cargar los recordatorios:', error);
        }
    };
    const handleCreateReminder = async (data) => {
        try {
            await reminderService.createReminder(data);
            await loadReminders();
        }
        catch (error) {
            console.error('Error al crear el recordatorio:', error);
        }
    };
    const handleCancelReminder = async (id) => {
        try {
            await reminderService.cancelReminder(id);
            await loadReminders();
        }
        catch (error) {
            console.error('Error al cancelar el recordatorio:', error);
        }
    };
    return (_jsx(MainLayout, { children: _jsxs(Box, { sx: { p: 3, mt: { xs: 0, md: 4 } }, children: [_jsxs(Box, { sx: {
                        mb: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'relative',
                        zIndex: 1
                    }, children: [_jsx(Typography, { variant: "h4", component: "h1", sx: { color: 'rgb(55, 53, 47)' }, children: "Recordatorios" }), _jsx(Button, { startIcon: _jsx(AddIcon, { sx: { fontSize: 20 } }), onClick: () => setIsDialogOpen(true), sx: {
                                color: 'rgb(55, 53, 47)',
                                backgroundColor: 'transparent',
                                textTransform: 'none',
                                fontSize: '14px',
                                padding: '6px 12px',
                                '&:hover': {
                                    backgroundColor: 'rgba(55, 53, 47, 0.08)'
                                }
                            }, children: "Nuevo recordatorio" })] }), _jsx(List, { sx: {
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                    }, children: reminders.length === 0 ? (_jsx(ListItem, { children: _jsx(ListItemText, { primary: _jsx(Typography, { align: "center", color: "text.secondary", children: "No hay recordatorios pendientes" }) }) })) : (reminders.map((reminder) => (_jsx(ListItem, { sx: {
                            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                            '&:last-child': {
                                borderBottom: 'none'
                            },
                            '&:hover': {
                                bgcolor: 'rgba(55, 53, 47, 0.04)'
                            }
                        }, secondaryAction: _jsx(IconButton, { edge: "end", onClick: () => handleCancelReminder(reminder.id), sx: {
                                color: 'rgb(55, 53, 47)',
                                opacity: 0.6,
                                '&:hover': {
                                    opacity: 1,
                                    backgroundColor: 'rgba(55, 53, 47, 0.08)'
                                }
                            }, children: _jsx(DeleteIcon, {}) }), children: _jsx(ListItemText, { primary: _jsx(Typography, { variant: "subtitle1", sx: {
                                    fontWeight: 500,
                                    color: 'rgb(55, 53, 47)'
                                }, children: reminder.title }), secondary: _jsxs(Box, { children: [reminder.message && (_jsx(Typography, { variant: "body2", sx: {
                                            mb: 0.5,
                                            color: 'rgba(55, 53, 47, 0.65)'
                                        }, children: reminder.message })), _jsxs(Typography, { variant: "caption", sx: {
                                            display: 'block',
                                            fontSize: isMobile ? '0.75rem' : '0.7rem',
                                            color: 'rgba(55, 53, 47, 0.5)'
                                        }, children: ["Programado para: ", new Date(reminder.reminder_time).toLocaleString()] })] }) }) }, reminder.id)))) }), _jsx(ReminderDialog, { open: isDialogOpen, onClose: () => setIsDialogOpen(false), onSubmit: handleCreateReminder })] }) }));
};
export default ReminderList;
