import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, Box, Chip, List, ListItem, ListItemText, IconButton, Typography, Divider, } from '@mui/material';
import { getPriorityLabel, getStatusLabel, getPriorityColor } from '../utils/taskUtils';
import { useApp } from '../context/AppContext';
import LinkIcon from '@mui/icons-material/Link';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import LaunchIcon from '@mui/icons-material/Launch';
const TaskDialog = ({ open, onClose, task, onSave, onStatusChange, quickView = false }) => {
    const navigate = useNavigate();
    const { pages } = useApp();
    const [formData, setFormData] = useState({
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
        }
        else {
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
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name) {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    const handleSubmit = (e) => {
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
    const handleLinkPage = (pageId) => {
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
    const handleUnlinkPage = (pageId) => {
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
    const handleNavigateToPage = (pageId) => {
        navigate(`/page/${pageId}`);
        onClose();
    };
    const renderLinkedPages = () => {
        const linkedPages = Array.isArray(formData.linked_pages) ? formData.linked_pages : [];
        console.log('Renderizando páginas enlazadas:', linkedPages);
        console.log('Páginas disponibles:', pages);
        if (linkedPages.length === 0) {
            return (_jsx(Typography, { variant: "body2", color: "text.secondary", sx: { fontStyle: 'italic' }, children: "No hay p\u00E1ginas enlazadas" }));
        }
        return (_jsx(List, { dense: true, children: linkedPages.map(pageId => {
                const page = pages.find(p => p.id === pageId);
                console.log('Buscando página:', pageId, 'Encontrada:', page);
                if (!page)
                    return null;
                return (_jsx(ListItem, { secondaryAction: _jsx(_Fragment, { children: quickView ? (_jsx(IconButton, { edge: "end", onClick: () => handleNavigateToPage(pageId), size: "small", children: _jsx(LaunchIcon, { fontSize: "small" }) })) : (_jsx(IconButton, { edge: "end", onClick: () => handleUnlinkPage(pageId), size: "small", children: _jsx(DeleteIcon, { fontSize: "small" }) })) }), sx: {
                        cursor: quickView ? 'pointer' : 'default',
                        '&:hover': quickView ? {
                            backgroundColor: 'action.hover',
                        } : {}
                    }, onClick: quickView ? () => handleNavigateToPage(pageId) : undefined, children: _jsx(ListItemText, { primary: page.title, sx: {
                            '& .MuiListItemText-primary': {
                                fontSize: '0.875rem',
                                color: quickView ? 'primary.main' : 'text.primary'
                            }
                        } }) }, pageId));
            }) }));
    };
    const renderLinkDialog = () => (_jsxs(Dialog, { open: showLinkDialog, onClose: () => setShowLinkDialog(false), maxWidth: "sm", fullWidth: true, "aria-labelledby": "link-dialog-title", children: [_jsx(DialogTitle, { id: "link-dialog-title", children: "Enlazar p\u00E1gina" }), _jsx(DialogContent, { children: _jsx(List, { children: pages
                        .filter(page => !(formData.linked_pages || []).includes(page.id))
                        .map(page => (_jsx(ListItem, { button: true, onClick: () => handleLinkPage(page.id), children: _jsx(ListItemText, { primary: page.title }) }, page.id))) }) }), _jsx(DialogActions, { children: _jsx(Button, { onClick: () => setShowLinkDialog(false), children: "Cancelar" }) })] }));
    if (quickView && task) {
        return (_jsxs(Dialog, { open: open, onClose: onClose, maxWidth: "sm", fullWidth: true, "aria-labelledby": "task-dialog-title", children: [_jsx(DialogTitle, { id: "task-dialog-title", children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [task.title, _jsx(Chip, { label: getPriorityLabel(task.priority || 'medium'), size: "small", color: getPriorityColor(task.priority || 'medium') }), _jsx(Chip, { label: getStatusLabel(task.status || 'pending'), size: "small", variant: "outlined" })] }) }), _jsx(DialogContent, { children: _jsxs(Box, { sx: { mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }, children: [task.description && (_jsx(Box, { sx: { whiteSpace: 'pre-wrap' }, children: task.description })), _jsxs(Box, { sx: { color: 'text.secondary', fontSize: '0.875rem' }, children: ["Fecha l\u00EDmite: ", task.due_date ? new Date(task.due_date).toLocaleString() : 'No establecida'] }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Estado:" }), _jsx(Chip, { label: getStatusLabel(task.status || 'pending'), size: "small", variant: "outlined" })] }), _jsx(Divider, { sx: { my: 1 } }), _jsxs(Box, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }, children: [_jsx(Typography, { variant: "subtitle2", children: "P\u00E1ginas enlazadas" }), _jsx(Button, { startIcon: _jsx(LinkIcon, {}), size: "small", onClick: () => setShowLinkDialog(true), children: "Enlazar p\u00E1gina" })] }), renderLinkedPages()] })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: onClose, children: "Cancelar" }), _jsx(Button, { onClick: () => {
                                if (onSave) {
                                    onSave(formData);
                                }
                                onClose();
                            }, variant: "contained", children: "Guardar" })] })] }));
    }
    return (_jsxs(_Fragment, { children: [_jsx(Dialog, { open: open, onClose: onClose, maxWidth: "sm", fullWidth: true, "aria-labelledby": "task-dialog-title", children: _jsxs("form", { onSubmit: handleSubmit, children: [_jsx(DialogTitle, { id: "task-dialog-title", children: task ? 'Editar Tarea' : 'Nueva Tarea' }), _jsx(DialogContent, { children: _jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }, children: [_jsx(TextField, { name: "title", label: "T\u00EDtulo", value: formData.title, onChange: handleChange, fullWidth: true, required: true }), _jsx(TextField, { name: "description", label: "Descripci\u00F3n", value: formData.description, onChange: handleChange, fullWidth: true, multiline: true, rows: 3 }), _jsx(TextField, { name: "due_date", label: "Fecha l\u00EDmite", type: "datetime-local", value: formData.due_date ? new Date(formData.due_date).toISOString().slice(0, 16) : '', onChange: handleChange, fullWidth: true, InputLabelProps: {
                                            shrink: true,
                                        } }), _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "Estado" }), _jsxs(Select, { name: "status", value: formData.status || 'pending', onChange: handleChange, label: "Estado", children: [_jsx(MenuItem, { value: "pending", children: "\u2B55 Pendiente" }), _jsx(MenuItem, { value: "in_progress", children: "\uD83D\uDD04 En Progreso" }), _jsx(MenuItem, { value: "completed", children: "\u2705 Completada" })] })] }), _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "Prioridad" }), _jsxs(Select, { name: "priority", value: formData.priority || 'medium', onChange: handleChange, label: "Prioridad", children: [_jsx(MenuItem, { value: "low", children: "\uD83D\uDFE2 Baja" }), _jsx(MenuItem, { value: "medium", children: "\uD83D\uDFE1 Media" }), _jsx(MenuItem, { value: "high", children: "\uD83D\uDD34 Alta" })] })] }), _jsxs(Box, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }, children: [_jsx(Typography, { variant: "subtitle2", children: "P\u00E1ginas enlazadas" }), _jsx(Button, { startIcon: _jsx(LinkIcon, {}), size: "small", onClick: () => setShowLinkDialog(true), children: "Enlazar p\u00E1gina" })] }), renderLinkedPages()] })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: onClose, children: "Cancelar" }), _jsx(Button, { type: "submit", variant: "contained", children: task ? 'Guardar' : 'Crear' })] })] }) }), renderLinkDialog()] }));
};
export default TaskDialog;
