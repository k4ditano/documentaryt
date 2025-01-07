import React from 'react';
interface NotificationContextType {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showInfo: (message: string) => void;
    showWarning: (message: string) => void;
}
declare const NotificationContext: React.Context<NotificationContextType | undefined>;
export declare const NotificationProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useNotification: () => NotificationContextType;
export default NotificationContext;
