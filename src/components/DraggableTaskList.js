import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText, IconButton, Chip, Collapse } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { getPriorityLabel, getPriorityColor } from '../utils/taskUtils';
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors, useDroppable, } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
const SortableTaskItem = ({ task, onEdit, onDelete, onView }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, } = useSortable({
        id: task.id.toString(),
        disabled: false
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        pointerEvents: isDragging ? 'none' : 'auto',
    };
    const handleEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onEdit(task);
    };
    const handleDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(task.id);
    };
    const handleView = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onView(task);
    };
    return (_jsxs(ListItem, { ref: setNodeRef, style: style, ...attributes, sx: {
            bgcolor: 'background.paper',
            mb: 1,
            borderRadius: 1,
            '&:hover': {
                bgcolor: 'action.hover',
            },
            position: 'relative',
            pr: 12, // Espacio para los botones
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
        }, children: [_jsx(Box, { ...listeners, sx: { flex: 1, display: 'flex', alignItems: 'center' }, children: _jsx(ListItemText, { primary: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Typography, { variant: "body1", children: task.title }), _jsx(Chip, { label: getPriorityLabel(task.priority), size: "small", color: getPriorityColor(task.priority) })] }), secondary: _jsxs(Box, { sx: { mt: 1 }, children: [task.description && (_jsx(Typography, { variant: "body2", color: "text.secondary", sx: {
                                    mb: 1,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }, children: task.description })), _jsxs(Typography, { variant: "caption", color: "text.secondary", component: "div", children: ["Fecha l\u00EDmite: ", new Date(task.due_date).toLocaleString()] })] }) }) }), _jsxs(Box, { sx: {
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    gap: 0.5,
                    zIndex: 1,
                    opacity: isDragging ? 0 : 1,
                    pointerEvents: isDragging ? 'none' : 'auto',
                }, onClick: (e) => e.stopPropagation(), children: [_jsx(IconButton, { onClick: handleView, size: "small", sx: {
                            color: 'action.active',
                            '&:hover': { color: 'info.main' },
                            visibility: 'visible',
                        }, children: _jsx(VisibilityIcon, { fontSize: "small" }) }), _jsx(IconButton, { onClick: handleEdit, size: "small", sx: {
                            color: 'action.active',
                            '&:hover': { color: 'primary.main' },
                            visibility: 'visible',
                        }, children: _jsx(EditIcon, { fontSize: "small" }) }), _jsx(IconButton, { onClick: handleDelete, size: "small", sx: {
                            color: 'action.active',
                            '&:hover': { color: 'error.main' },
                            visibility: 'visible',
                        }, children: _jsx(DeleteIcon, { fontSize: "small" }) })] })] }));
};
const DroppableContainer = ({ id, title, isExpanded, onToggle, children }) => {
    const { setNodeRef } = useDroppable({ id });
    return (_jsx(Box, { ref: setNodeRef, sx: {
            flex: { xs: '0 0 100%', md: '1 1 0' },
            minWidth: { xs: '100%', md: '250px' },
            maxWidth: { xs: '100%', md: 'calc(33.333% - 16px)' },
        }, children: _jsxs(Paper, { sx: {
                p: 2,
                height: 'fit-content',
                backgroundColor: 'background.default',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                width: '100%',
            }, children: [_jsxs(Box, { onClick: onToggle, sx: {
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        borderRadius: 1,
                        p: 1
                    }, children: [_jsx(IconButton, { size: "small", sx: { mr: 1 }, children: isExpanded ? _jsx(KeyboardArrowUpIcon, {}) : _jsx(KeyboardArrowDownIcon, {}) }), _jsx(Typography, { variant: "h6", component: "h3", sx: { fontWeight: 600 }, children: title })] }), _jsx(Collapse, { in: isExpanded, children: children })] }) }));
};
const STATES = [
    { id: 'pending', title: 'Por hacer' },
    { id: 'in_progress', title: 'En progreso' },
    { id: 'completed', title: 'Completado' }
];
const DraggableTaskList = ({ tasks, onTaskMove, onEditTask, onDeleteTask, onViewTask, expandedStates, onToggleState }) => {
    const [activeId, setActiveId] = React.useState(null);
    const sensors = useSensors(useSensor(MouseSensor, {
        activationConstraint: {
            distance: 8,
        },
    }), useSensor(TouchSensor, {
        activationConstraint: {
            delay: 200,
            tolerance: 8,
        },
    }));
    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };
    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const taskId = parseInt(active.id);
            const newStatus = over.id;
            const taskToMove = tasks.find(t => t.id === taskId);
            if (taskToMove) {
                try {
                    await onTaskMove(taskId, newStatus);
                }
                catch (error) {
                    console.error('Error al mover la tarea:', error);
                }
            }
        }
        setActiveId(null);
    };
    const getTasksByStatus = (status) => {
        return tasks.filter(task => task.status === status);
    };
    return (_jsxs(DndContext, { sensors: sensors, onDragStart: handleDragStart, onDragEnd: handleDragEnd, children: [_jsx(Box, { sx: {
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    flexWrap: 'nowrap',
                    gap: 2,
                    width: '100%',
                    alignItems: 'flex-start',
                    '& > *': {
                        height: { md: 'calc(100vh - 200px)' },
                        overflowY: { md: 'auto' },
                    }
                }, children: STATES.map(state => (_jsx(DroppableContainer, { id: state.id, title: state.title, isExpanded: expandedStates[state.id], onToggle: () => onToggleState(state.id), children: _jsx(List, { sx: {
                            width: '100%',
                            p: 0,
                            minHeight: '100px', // Aumentado para mejor área de drop
                            backgroundColor: 'background.paper',
                            borderRadius: 1,
                            opacity: 0.8,
                        }, children: _jsx(SortableContext, { items: getTasksByStatus(state.id).map(t => t.id.toString()), strategy: verticalListSortingStrategy, children: getTasksByStatus(state.id).map(task => (_jsx(SortableTaskItem, { task: task, onEdit: onEditTask, onDelete: onDeleteTask, onView: onViewTask }, task.id))) }) }) }, state.id))) }), _jsx(DragOverlay, { children: activeId ? (_jsx(Paper, { sx: {
                        p: 2,
                        backgroundColor: 'background.paper',
                        borderRadius: 1,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        width: { xs: '280px', md: '300px' }
                    }, children: tasks.find(task => task.id.toString() === activeId)?.title })) : null })] }));
};
export default DraggableTaskList;
