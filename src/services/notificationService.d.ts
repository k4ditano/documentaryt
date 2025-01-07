export interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: 'task' | 'reminder' | 'system';
    read: boolean;
    reference_id: number | null;
    reference_type: string | null;
    created_at: string;
}
export declare const notificationService: {
    getAllNotifications: () => Promise<Notification[]>;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    getUnreadCount: () => Promise<number>;
    deleteNotification: (id: number) => Promise<void>;
};
