import { TaskStatus } from '../services/taskService';

export type TaskPriority = 'high' | 'medium' | 'low';

export const getPriorityLabel = (priority: string) => {
    switch (priority) {
        case 'high': return '🔴 Alta';
        case 'medium': return '🟡 Media';
        case 'low': return '🟢 Baja';
        default: return priority;
    }
};

export const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
        case 'pending': return '⭕ Pendiente';
        case 'in_progress': return '🔄 En Progreso';
        case 'completed': return '✅ Completada';
        default: return status;
    }
};

export const getPriorityColor = (priority: string): 'error' | 'warning' | 'success' | 'default' => {
    switch (priority) {
        case 'high': return 'error';
        case 'medium': return 'warning';
        case 'low': return 'success';
        default: return 'default';
    }
};

export const getPriorityBackgroundColor = (priority: string): string => {
    switch (priority) {
        case 'high': return '#d32f2f';
        case 'medium': return '#f57c00';
        case 'low': return '#388e3c';
        default: return '#3174ad';
    }
}; 