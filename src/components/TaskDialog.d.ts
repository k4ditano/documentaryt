import React from 'react';
import { Task, TaskStatus } from '../services/taskService';
interface TaskDialogProps {
    open: boolean;
    onClose: () => void;
    task: Task | null;
    onSave?: (task: Partial<Task>) => void;
    onStatusChange?: (status: TaskStatus) => void;
    quickView?: boolean;
}
declare const TaskDialog: React.FC<TaskDialogProps>;
export default TaskDialog;
