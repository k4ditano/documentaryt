import React from 'react';
interface ReminderDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: {
        title: string;
        message?: string;
        reminderTime: Date;
    }) => void;
}
declare const ReminderDialog: React.FC<ReminderDialogProps>;
export default ReminderDialog;
