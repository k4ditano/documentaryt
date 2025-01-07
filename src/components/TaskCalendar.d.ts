import React from 'react';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { Page } from '../types';
interface TaskCalendarProps {
    pages: Page[];
}
declare const TaskCalendar: React.FC<TaskCalendarProps>;
export default TaskCalendar;
