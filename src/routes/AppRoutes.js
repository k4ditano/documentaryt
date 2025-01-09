import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { AppProvider } from '../context/AppContext';
import { NotificationProvider } from '../context/NotificationContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Profile from '../components/auth/Profile';
import Settings from '../components/auth/Settings';
import TaskCalendar from '../components/TaskCalendar';
import TaskList from '../components/TaskList';
import ReminderList from '../components/ReminderList';
import AISearch from '../components/AISearch';
import PrivateRoute from '../components/PrivateRoute';
import { useApp } from '../context/AppContext';
const AppContent = () => {
    const { pages } = useApp();
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { path: "/", element: _jsx(PrivateRoute, { children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/profile", element: _jsx(PrivateRoute, { children: _jsx(Profile, {}) }) }), _jsx(Route, { path: "/settings", element: _jsx(PrivateRoute, { children: _jsx(Settings, {}) }) }), _jsx(Route, { path: "/calendar", element: _jsx(PrivateRoute, { children: _jsx(TaskCalendar, { pages: pages }) }) }), _jsx(Route, { path: "/tasks", element: _jsx(PrivateRoute, { children: _jsx(TaskList, {}) }) }), _jsx(Route, { path: "/reminders", element: _jsx(PrivateRoute, { children: _jsx(ReminderList, {}) }) }), _jsx(Route, { path: "/search", element: _jsx(PrivateRoute, { children: _jsx(AISearch, {}) }) })] }));
};
const AppRoutes = () => {
    return (_jsx(LocalizationProvider, { dateAdapter: AdapterDateFns, adapterLocale: es, children: _jsx(AppProvider, { children: _jsx(NotificationProvider, { children: _jsx(AppContent, {}) }) }) }));
};
export default AppRoutes;
