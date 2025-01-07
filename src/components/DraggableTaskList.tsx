import React from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText, IconButton, Chip, Collapse } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Task, TaskStatus } from '../services/taskService';
import { getPriorityLabel, getStatusLabel, getPriorityColor } from '../utils/taskUtils';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableTaskItemProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: number) => void;
    onView: (task: Task) => void;
}

const SortableTaskItem: React.FC<SortableTaskItemProps> = ({ task, onEdit, onDelete, onView }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ 
        id: task.id.toString(),
        disabled: false
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        pointerEvents: isDragging ? 'none' as const : 'auto' as const,
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onEdit(task);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(task.id);
    };

    const handleView = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onView(task);
    };

    return (
        <ListItem
            ref={setNodeRef}
            style={style}
            {...attributes}
            sx={{
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
            }}
        >
            <Box {...listeners} sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <ListItemText
                    primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">{task.title}</Typography>
                            <Chip
                                label={getPriorityLabel(task.priority)}
                                size="small"
                                color={getPriorityColor(task.priority)}
                            />
                        </Box>
                    }
                    secondary={
                        <Box sx={{ mt: 1 }}>
                            {task.description && (
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary" 
                                    sx={{ 
                                        mb: 1,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {task.description}
                                </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary" component="div">
                                Fecha límite: {new Date(task.due_date as string).toLocaleString()}
                            </Typography>
                        </Box>
                    }
                />
            </Box>
            <Box
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    gap: 0.5,
                    zIndex: 1,
                    opacity: isDragging ? 0 : 1,
                    pointerEvents: isDragging ? 'none' : 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <IconButton
                    onClick={handleView}
                    size="small"
                    sx={{
                        color: 'action.active',
                        '&:hover': { color: 'info.main' },
                        visibility: 'visible',
                    }}
                >
                    <VisibilityIcon fontSize="small" />
                </IconButton>
                <IconButton
                    onClick={handleEdit}
                    size="small"
                    sx={{
                        color: 'action.active',
                        '&:hover': { color: 'primary.main' },
                        visibility: 'visible',
                    }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                    onClick={handleDelete}
                    size="small"
                    sx={{
                        color: 'action.active',
                        '&:hover': { color: 'error.main' },
                        visibility: 'visible',
                    }}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Box>
        </ListItem>
    );
};

interface DroppableContainerProps {
    id: string;
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

const DroppableContainer: React.FC<DroppableContainerProps> = ({ 
    id, 
    title, 
    isExpanded,
    onToggle,
    children 
}) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <Box
            ref={setNodeRef}
            sx={{
                flex: { xs: '0 0 100%', md: '1 1 0' },
                minWidth: { xs: '100%', md: '250px' },
                maxWidth: { xs: '100%', md: 'calc(33.333% - 16px)' },
            }}
        >
            <Paper
                sx={{
                    p: 2,
                    height: 'fit-content',
                    backgroundColor: 'background.default',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    width: '100%',
                }}
            >
                <Box 
                    onClick={onToggle}
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        borderRadius: 1,
                        p: 1
                    }}
                >
                    <IconButton size="small" sx={{ mr: 1 }}>
                        {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                        {title}
                    </Typography>
                </Box>
                <Collapse in={isExpanded}>
                    {children}
                </Collapse>
            </Paper>
        </Box>
    );
};

interface DraggableTaskListProps {
    tasks: Task[];
    onTaskMove: (taskId: number, newStatus: TaskStatus) => Promise<void>;
    onEditTask: (task: Task) => void;
    onDeleteTask: (id: number) => void;
    onViewTask: (task: Task) => void;
    expandedStates: Record<string, boolean>;
    onToggleState: (stateId: string) => void;
}

const STATES = [
    { id: 'pending', title: 'Por hacer' },
    { id: 'in_progress', title: 'En progreso' },
    { id: 'completed', title: 'Completado' }
];

const DraggableTaskList: React.FC<DraggableTaskListProps> = ({
    tasks,
    onTaskMove,
    onEditTask,
    onDeleteTask,
    onViewTask,
    expandedStates,
    onToggleState
}) => {
    const [activeId, setActiveId] = React.useState<string | null>(null);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const taskId = parseInt(active.id as string);
            const newStatus = over.id as TaskStatus;
            const taskToMove = tasks.find(t => t.id === taskId);
            
            if (taskToMove) {
                try {
                    await onTaskMove(taskId, newStatus);
                } catch (error) {
                    console.error('Error al mover la tarea:', error);
                }
            }
        }

        setActiveId(null);
    };

    const getTasksByStatus = (status: TaskStatus) => {
        return tasks.filter(task => task.status === status);
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <Box
                sx={{
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
                }}
            >
                {STATES.map(state => (
                    <DroppableContainer
                        key={state.id}
                        id={state.id}
                        title={state.title}
                        isExpanded={expandedStates[state.id]}
                        onToggle={() => onToggleState(state.id)}
                    >
                        <List sx={{ 
                            width: '100%', 
                            p: 0,
                            minHeight: '100px', // Aumentado para mejor área de drop
                            backgroundColor: 'background.paper',
                            borderRadius: 1,
                            opacity: 0.8,
                        }}>
                            <SortableContext
                                items={getTasksByStatus(state.id as TaskStatus).map(t => t.id.toString())}
                                strategy={verticalListSortingStrategy}
                            >
                                {getTasksByStatus(state.id as TaskStatus).map(task => (
                                    <SortableTaskItem
                                        key={task.id}
                                        task={task}
                                        onEdit={onEditTask}
                                        onDelete={onDeleteTask}
                                        onView={onViewTask}
                                    />
                                ))}
                            </SortableContext>
                        </List>
                    </DroppableContainer>
                ))}
            </Box>

            <DragOverlay>
                {activeId ? (
                    <Paper
                        sx={{
                            p: 2,
                            backgroundColor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            width: { xs: '280px', md: '300px' }
                        }}
                    >
                        {tasks.find(task => task.id.toString() === activeId)?.title}
                    </Paper>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default DraggableTaskList; 