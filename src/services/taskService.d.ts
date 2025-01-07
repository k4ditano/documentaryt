export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';
export interface Task {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date: string;
    created_at?: string;
    updated_at?: string;
    user_id?: number;
    linked_pages?: string[];
}
export declare const taskService: {
    getAllTasks: () => Promise<Task[]>;
    createTask: (task: Omit<Task, "id" | "created_at" | "updated_at" | "user_id">) => Promise<Task>;
    updateTask: (id: number, taskData: Partial<Task>) => Promise<Task>;
    deleteTask: (id: number) => Promise<void>;
    getTasksByDateRange: (start: string, end: string) => Promise<Task[]>;
};
