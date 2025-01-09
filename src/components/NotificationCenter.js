import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Badge, IconButton, Popover, List, ListItem, ListItemText, Typography, Box, Button, Divider, useTheme, useMediaQuery, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteIcon from '@mui/icons-material/Delete';
import { notificationService } from '../services/notificationService';
const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000); // Actualizar cada 30 segundos
        return () => clearInterval(interval);
    }, []);
    const loadNotifications = async () => {
        try {
            const [notificationsData, count] = await Promise.all([
                notificationService.getAllNotifications(),
                notificationService.getUnreadCount()
            ]);
            setNotifications(notificationsData);
            setUnreadCount(count);
        }
        catch (error) {
            console.error('Error al cargar las notificaciones:', error);
        }
    };
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            await loadNotifications();
        }
        catch (error) {
            console.error('Error al marcar las notificaciones como leídas:', error);
        }
    };
    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            await loadNotifications();
        }
        catch (error) {
            console.error('Error al marcar la notificación como leída:', error);
        }
    };
    const handleDelete = async (id) => {
        try {
            await notificationService.deleteNotification(id);
            await loadNotifications();
        }
        catch (error) {
            console.error('Error al eliminar la notificación:', error);
        }
    };
    const renderNotificationList = () => (_jsx(List, { sx: { maxHeight: isMobile ? 'calc(100vh - 120px)' : 400, overflow: 'auto' }, children: notifications.length === 0 ? (_jsx(ListItem, { children: _jsx(ListItemText, { primary: _jsx(Typography, { align: "center", color: "text.secondary", children: "No hay notificaciones" }) }) })) : (notifications.map((notification) => (_jsx(ListItem, { onClick: () => handleMarkAsRead(notification.id), sx: {
                bgcolor: notification.read ? 'transparent' : 'action.hover',
                cursor: 'pointer',
                '&:hover': {
                    bgcolor: notification.read ? 'action.hover' : 'action.selected'
                }
            }, secondaryAction: _jsx(IconButton, { edge: "end", onClick: (e) => {
                    e.stopPropagation();
                    handleDelete(notification.id);
                }, sx: {
                    opacity: 0.7,
                    '&:hover': {
                        opacity: 1
                    }
                }, children: _jsx(DeleteIcon, {}) }), children: _jsx(ListItemText, { primary: _jsx(Typography, { variant: "subtitle2", sx: {
                        fontWeight: notification.read ? 'normal' : 'bold',
                        fontSize: isMobile ? '0.9rem' : '0.875rem'
                    }, children: notification.title }), secondary: _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", color: "text.secondary", sx: {
                                fontSize: isMobile ? '0.85rem' : '0.8rem',
                                mb: 0.5
                            }, children: notification.message }), _jsx(Typography, { variant: "caption", color: "text.secondary", sx: { fontSize: isMobile ? '0.75rem' : '0.7rem' }, children: new Date(notification.created_at).toLocaleString() })] }) }) }, notification.id)))) }));
    const open = Boolean(anchorEl);
    return (_jsxs(_Fragment, { children: [_jsx(IconButton, { onClick: handleClick, color: "inherit", sx: {
                    color: 'rgba(0, 0, 0, 0.54)',
                    padding: 0,
                }, children: _jsx(Badge, { badgeContent: unreadCount, color: "error", children: _jsx(NotificationsIcon, {}) }) }), isMobile ? (_jsxs(Dialog, { fullScreen: isMobile, open: open, onClose: handleClose, PaperProps: {
                    sx: {
                        margin: 0,
                        maxHeight: '100%',
                        height: '100%'
                    }
                }, children: [_jsx(DialogTitle, { sx: { px: 2, py: 1.5 }, children: _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Typography, { variant: "h6", children: "Notificaciones" }), _jsx(Button, { onClick: handleMarkAllAsRead, size: "small", children: "Marcar todo como le\u00EDdo" })] }) }), _jsx(Divider, {}), _jsx(DialogContent, { sx: { p: 0 }, children: renderNotificationList() }), _jsx(DialogActions, { children: _jsx(Button, { onClick: handleClose, fullWidth: true, children: "Cerrar" }) })] })) : (_jsx(Popover, { open: open, anchorEl: anchorEl, onClose: handleClose, anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right',
                }, transformOrigin: {
                    vertical: 'top',
                    horizontal: 'right',
                }, children: _jsxs(Box, { sx: { width: 400, maxHeight: 500 }, children: [_jsxs(Box, { sx: { p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Typography, { variant: "h6", children: "Notificaciones" }), _jsx(Button, { onClick: handleMarkAllAsRead, size: "small", children: "Marcar todo como le\u00EDdo" })] }), _jsx(Divider, {}), renderNotificationList()] }) }))] }));
};
export default NotificationCenter;
