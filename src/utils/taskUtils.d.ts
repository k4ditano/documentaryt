import { TaskStatus } from '../services/taskService';
export type TaskPriority = 'high' | 'medium' | 'low';
export declare const getPriorityLabel: (priority: string) => string;
export declare const getStatusLabel: (status: TaskStatus) => "⭕ Pendiente" | "🔄 En Progreso" | "✅ Completada";
export declare const getPriorityColor: (priority: string) => "error" | "warning" | "success" | "default";
export declare const getPriorityBackgroundColor: (priority: string) => string;
