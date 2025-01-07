import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Chip,
    SelectChangeEvent,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Typography,
    Divider,
} from '@mui/material';
import { Task, TaskStatus } from '../services/taskService';
import { getPriorityLabel, getStatusLabel, getPriorityColor } from '../utils/taskUtils';
import { useApp } from '../context/AppContext';
import LinkIcon from '@mui/icons-material/Link';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import LaunchIcon from '@mui/icons-material/Launch';

interface TaskDialogProps {
    open: boolean;
    onClose: () => void;
    task: Task | null;
    onSave?: (task: Partial<Task>) => void;
    onStatusChange?: (status: TaskStatus) => void;
    quickView?: boolean;
}

const TaskDialog: React.FC<TaskDialogProps> = ({ 
    open, 
    onClose, 
    task, 
    onSave, 
    onStatusChange,
    quickView = false 
}) => {
    const navigate = useNavigate();
    const { pages } = useApp();
    const [formData, setFormData] = useState<Partial<Task>>({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        due_date: new Date().toISOString(),
        linked_pages: []
    });
    const [showLinkDialog, setShowLinkDialog] = useState(false);

    useEffect(() => {
        if (task) {
            console.log('Actualizando formData con tarea:', task);
            console.log('Páginas enlazadas recibidas:', task.linked_pages);
            const linkedPages = Array.isArray(task.linked_pages) ? task.linked_pages : [];
            console.log('Páginas enlazadas procesadas:', linkedPages);
            
            setFormData({
                ...task,
                title: task.title || '',
                description: task.description || '',
                status: task.status || 'pending',
                priority: task.priority || 'medium',
                due_date: task.due_date || new Date().toISOString(),
                linked_pages: linkedPages
            });
        } else {
            setFormData({
                title: '',
                description: '',
                status: 'pending',
                priority: 'medium',
                due_date: new Date().toISOString(),
                linked_pages: []
            });
        }
    }, [task]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
    ) => {
        const { name, value } = e.target;
        if (name) {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSave) {
            const linkedPages = Array.isArray(formData.linked_pages) ? formData.linked_pages : [];
            const dataToSave = {
                ...formData,
                linked_pages: linkedPages,
                id: task?.id
            };
            console.log('Guardando tarea con datos:', dataToSave);
            onSave(dataToSave);
        }
    };

    const handleLinkPage = (pageId: string) => {
        console.log('Intentando enlazar página:', pageId);
        console.log('Estado actual de formData:', formData);
        
        const linkedPages = Array.isArray(formData.linked_pages) ? formData.linked_pages : [];
        if (!linkedPages.includes(pageId)) {
            const updatedPages = [...linkedPages, pageId];
            const updatedData = {
                ...formData,
                linked_pages: updatedPages,
                id: task?.id
            };
            console.log('Actualizando estado local con:', updatedData);
            setFormData(updatedData);
        }
        setShowLinkDialog(false);
    };

    const handleUnlinkPage = (pageId: string) => {
        console.log('Intentando desenlazar página:', pageId);
        console.log('Estado actual de formData:', formData);
        
        const linkedPages = Array.isArray(formData.linked_pages) ? formData.linked_pages : [];
        const updatedPages = linkedPages.filter(id => id !== pageId);
        const updatedData = {
            ...formData,
            linked_pages: updatedPages,
            id: task?.id
        };
        console.log('Actualizando estado local con:', updatedData);
        setFormData(updatedData);
    };

    const handleNavigateToPage = (pageId: string) => {
        navigate(`/page/${pageId}`);
        onClose();
    };

    const renderLinkedPages = () => {
        const linkedPages = Array.isArray(formData.linked_pages) ? formData.linked_pages : [];
        console.log('Renderizando páginas enlazadas:', linkedPages);
        console.log('Páginas disponibles:', pages);
        
        if (linkedPages.length === 0) {
            return (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No hay páginas enlazadas
                </Typography>
            );
        }

        return (
            <List dense>
                {linkedPages.map(pageId => {
                    const page = pages.find(p => p.id === pageId);
                    console.log('Buscando página:', pageId, 'Encontrada:', page);
                    if (!page) return null;

                    return (
                        <ListItem
                            key={pageId}
                            secondaryAction={
                                <>
                                    {quickView ? (
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleNavigateToPage(pageId)}
                                            size="small"
                                        >
                                            <LaunchIcon fontSize="small" />
                                        </IconButton>
                                    ) : (
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleUnlinkPage(pageId)}
                                            size="small"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </>
                            }
                            sx={{
                                cursor: quickView ? 'pointer' : 'default',
                                '&:hover': quickView ? {
                                    backgroundColor: 'action.hover',
                                } : {}
                            }}
                            onClick={quickView ? () => handleNavigateToPage(pageId) : undefined}
                        >
                            <ListItemText
                                primary={page.title}
                                sx={{ 
                                    '& .MuiListItemText-primary': { 
                                        fontSize: '0.875rem',
                                        color: quickView ? 'primary.main' : 'text.primary'
                                    } 
                                }}
                            />
                        </ListItem>
                    );
                })}
            </List>
        );
    };

    const renderLinkDialog = () => (
        <Dialog 
            open={showLinkDialog} 
            onClose={() => setShowLinkDialog(false)} 
            maxWidth="sm" 
            fullWidth
            aria-labelledby="link-dialog-title"
        >
            <DialogTitle id="link-dialog-title">Enlazar página</DialogTitle>
            <DialogContent>
                <List>
                    {pages
                        .filter(page => !(formData.linked_pages || []).includes(page.id))
                        .map(page => (
                            <ListItem
                                key={page.id}
                                button
                                onClick={() => handleLinkPage(page.id)}
                            >
                                <ListItemText primary={page.title} />
                            </ListItem>
                        ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setShowLinkDialog(false)}>Cancelar</Button>
            </DialogActions>
        </Dialog>
    );

    if (quickView && task) {
        return (
            <Dialog 
                open={open} 
                onClose={onClose} 
                maxWidth="sm" 
                fullWidth
                aria-labelledby="task-dialog-title"
            >
                <DialogTitle id="task-dialog-title">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {task.title}
                        <Chip
                            label={getPriorityLabel(task.priority || 'medium')}
                            size="small"
                            color={getPriorityColor(task.priority || 'medium')}
                        />
                        <Chip
                            label={getStatusLabel(task.status || 'pending')}
                            size="small"
                            variant="outlined"
                        />
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {task.description && (
                            <Box sx={{ whiteSpace: 'pre-wrap' }}>
                                {task.description}
                            </Box>
                        )}
                        <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                            Fecha límite: {task.due_date ? new Date(task.due_date).toLocaleString() : 'No establecida'}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Estado:
                            </Typography>
                            <Chip
                                label={getStatusLabel(task.status || 'pending')}
                                size="small"
                                variant="outlined"
                            />
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2">
                                    Páginas enlazadas
                                </Typography>
                                <Button
                                    startIcon={<LinkIcon />}
                                    size="small"
                                    onClick={() => setShowLinkDialog(true)}
                                >
                                    Enlazar página
                                </Button>
                            </Box>
                            {renderLinkedPages()}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button 
                        onClick={() => {
                            if (onSave) {
                                onSave(formData);
                            }
                            onClose();
                        }} 
                        variant="contained"
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    return (
        <>
            <Dialog 
                open={open} 
                onClose={onClose} 
                maxWidth="sm" 
                fullWidth
                aria-labelledby="task-dialog-title"
            >
                <form onSubmit={handleSubmit}>
                    <DialogTitle id="task-dialog-title">
                        {task ? 'Editar Tarea' : 'Nueva Tarea'}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <TextField
                                name="title"
                                label="Título"
                                value={formData.title}
                                onChange={handleChange}
                                fullWidth
                                required
                            />

                            <TextField
                                name="description"
                                label="Descripción"
                                value={formData.description}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={3}
                            />

                            <TextField
                                name="due_date"
                                label="Fecha límite"
                                type="datetime-local"
                                value={formData.due_date ? new Date(formData.due_date).toISOString().slice(0, 16) : ''}
                                onChange={handleChange}
                                fullWidth
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                            <FormControl fullWidth>
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    name="status"
                                    value={formData.status || 'pending'}
                                    onChange={handleChange}
                                    label="Estado"
                                >
                                    <MenuItem value="pending">⭕ Pendiente</MenuItem>
                                    <MenuItem value="in_progress">🔄 En Progreso</MenuItem>
                                    <MenuItem value="completed">✅ Completada</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>Prioridad</InputLabel>
                                <Select
                                    name="priority"
                                    value={formData.priority || 'medium'}
                                    onChange={handleChange}
                                    label="Prioridad"
                                >
                                    <MenuItem value="low">🟢 Baja</MenuItem>
                                    <MenuItem value="medium">🟡 Media</MenuItem>
                                    <MenuItem value="high">🔴 Alta</MenuItem>
                                </Select>
                            </FormControl>

                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="subtitle2">
                                        Páginas enlazadas
                                    </Typography>
                                    <Button
                                        startIcon={<LinkIcon />}
                                        size="small"
                                        onClick={() => setShowLinkDialog(true)}
                                    >
                                        Enlazar página
                                    </Button>
                                </Box>
                                {renderLinkedPages()}
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose}>Cancelar</Button>
                        <Button type="submit" variant="contained">
                            {task ? 'Guardar' : 'Crear'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            {renderLinkDialog()}
        </>
    );
}

export default TaskDialog; 