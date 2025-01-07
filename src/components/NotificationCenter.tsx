import React, { useState, useEffect } from 'react';
import {
    Badge,
    IconButton,
    Popover,
    List,
    ListItem,
    ListItemText,
    Typography,
    Box,
    Button,
    Divider,
    useTheme,
    useMediaQuery,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteIcon from '@mui/icons-material/Delete';
import { Notification, notificationService } from '../services/notificationService';

const NotificationCenter: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
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
        } catch (error) {
            console.error('Error al cargar las notificaciones:', error);
        }
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            await loadNotifications();
        } catch (error) {
            console.error('Error al marcar las notificaciones como leídas:', error);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            await loadNotifications();
        } catch (error) {
            console.error('Error al marcar la notificación como leída:', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await notificationService.deleteNotification(id);
            await loadNotifications();
        } catch (error) {
            console.error('Error al eliminar la notificación:', error);
        }
    };

    const renderNotificationList = () => (
        <List sx={{ maxHeight: isMobile ? 'calc(100vh - 120px)' : 400, overflow: 'auto' }}>
            {notifications.length === 0 ? (
                <ListItem>
                    <ListItemText
                        primary={
                            <Typography align="center" color="text.secondary">
                                No hay notificaciones
                            </Typography>
                        }
                    />
                </ListItem>
            ) : (
                notifications.map((notification) => (
                    <ListItem
                        key={notification.id}
                        onClick={() => handleMarkAsRead(notification.id)}
                        sx={{
                            bgcolor: notification.read ? 'transparent' : 'action.hover',
                            cursor: 'pointer',
                            '&:hover': {
                                bgcolor: notification.read ? 'action.hover' : 'action.selected'
                            }
                        }}
                        secondaryAction={
                            <IconButton
                                edge="end"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(notification.id);
                                }}
                                sx={{ 
                                    opacity: 0.7,
                                    '&:hover': {
                                        opacity: 1
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
                                    variant="subtitle2" 
                                    sx={{ 
                                        fontWeight: notification.read ? 'normal' : 'bold',
                                        fontSize: isMobile ? '0.9rem' : '0.875rem'
                                    }}
                                >
                                    {notification.title}
                                </Typography>
                            }
                            secondary={
                                <Box>
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        sx={{ 
                                            fontSize: isMobile ? '0.85rem' : '0.8rem',
                                            mb: 0.5 
                                        }}
                                    >
                                        {notification.message}
                                    </Typography>
                                    <Typography 
                                        variant="caption" 
                                        color="text.secondary"
                                        sx={{ fontSize: isMobile ? '0.75rem' : '0.7rem' }}
                                    >
                                        {new Date(notification.created_at).toLocaleString()}
                                    </Typography>
                                </Box>
                            }
                        />
                    </ListItem>
                ))
            )}
        </List>
    );

    const open = Boolean(anchorEl);

    return (
        <>
            <IconButton 
                onClick={handleClick} 
                color="inherit"
                sx={{
                    color: 'rgba(0, 0, 0, 0.54)',
                    padding: 0,
                }}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            {isMobile ? (
                <Dialog
                    fullScreen={isMobile}
                    open={open}
                    onClose={handleClose}
                    PaperProps={{
                        sx: {
                            margin: 0,
                            maxHeight: '100%',
                            height: '100%'
                        }
                    }}
                >
                    <DialogTitle sx={{ px: 2, py: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">Notificaciones</Typography>
                            <Button onClick={handleMarkAllAsRead} size="small">
                                Marcar todo como leído
                            </Button>
                        </Box>
                    </DialogTitle>
                    <Divider />
                    <DialogContent sx={{ p: 0 }}>
                        {renderNotificationList()}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} fullWidth>
                            Cerrar
                        </Button>
                    </DialogActions>
                </Dialog>
            ) : (
                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <Box sx={{ width: 400, maxHeight: 500 }}>
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">Notificaciones</Typography>
                            <Button onClick={handleMarkAllAsRead} size="small">
                                Marcar todo como leído
                            </Button>
                        </Box>
                        <Divider />
                        {renderNotificationList()}
                    </Box>
                </Popover>
            )}
        </>
    );
};

export default NotificationCenter; 