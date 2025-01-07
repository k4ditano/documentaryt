export interface Reminder {
    id: number;
    user_id: number;
    title: string;
    message: string | null;
    reminder_time: string;
    status: 'pending' | 'sent' | 'cancelled';
    created_at: string;
}
export declare const reminderService: {
    createReminder: (data: {
        title: string;
        message?: string;
        reminderTime: Date;
    }) => Promise<number>;
    getReminders: () => Promise<Reminder[]>;
    cancelReminder: (id: number) => Promise<void>;
};
