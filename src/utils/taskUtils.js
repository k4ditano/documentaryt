export const getPriorityLabel = (priority) => {
    switch (priority) {
        case 'high': return '🔴 Alta';
        case 'medium': return '🟡 Media';
        case 'low': return '🟢 Baja';
        default: return priority;
    }
};
export const getStatusLabel = (status) => {
    switch (status) {
        case 'pending': return '⭕ Pendiente';
        case 'in_progress': return '🔄 En Progreso';
        case 'completed': return '✅ Completada';
        default: return status;
    }
};
export const getPriorityColor = (priority) => {
    switch (priority) {
        case 'high': return 'error';
        case 'medium': return 'warning';
        case 'low': return 'success';
        default: return 'default';
    }
};
export const getPriorityBackgroundColor = (priority) => {
    switch (priority) {
        case 'high': return '#d32f2f';
        case 'medium': return '#f57c00';
        case 'low': return '#388e3c';
        default: return '#3174ad';
    }
};
