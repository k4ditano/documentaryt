export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    read: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
} 