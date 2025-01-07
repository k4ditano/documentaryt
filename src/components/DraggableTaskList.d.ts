import React from 'react';
import { Task, TaskStatus } from '../services/taskService';
interface DraggableTaskListProps {
    tasks: Task[];
    onTaskMove: (taskId: number, newStatus: TaskStatus) => Promise<void>;
    onEditTask: (task: Task) => void;
    onDeleteTask: (id: number) => void;
    onViewTask: (task: Task) => void;
    expandedStates: Record<string, boolean>;
    onToggleState: (stateId: string) => void;
}
declare const DraggableTaskList: React.FC<DraggableTaskListProps>;
export default DraggableTaskList;
