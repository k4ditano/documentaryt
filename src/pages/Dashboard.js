import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Box, Typography, CircularProgress, Alert, } from '@mui/material';
import Sidebar from '../components/Sidebar';
import TaskList from '../components/TaskList';
import TaskCalendar from '../components/TaskCalendar';
import ReminderList from '../components/ReminderList';
import AISearch from '../components/AISearch';
const Dashboard = () => {
    const { user } = useAuth();
    const { pages, folders, refreshPages, refreshFolders } = useApp();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('list');
    const [filteredPages, setFilteredPages] = useState([]);
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                await Promise.all([refreshPages(), refreshFolders()]);
            }
            catch (error) {
                console.error('Error al cargar los datos:', error);
                setError('Error al cargar los datos');
            }
            finally {
                setLoading(false);
            }
        };
        loadData();
    }, [refreshPages, refreshFolders]);
    useEffect(() => {
        setFilteredPages(pages);
    }, [pages]);
    if (loading) {
        return (_jsx(Box, { sx: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
            }, children: _jsx(CircularProgress, {}) }));
    }
    if (!user) {
        return (_jsx(Box, { sx: { p: 3 }, children: _jsx(Typography, { children: "Por favor inicia sesi\u00F3n para ver el dashboard." }) }));
    }
    return (_jsxs(Box, { sx: { display: 'flex', minHeight: '100vh' }, children: [_jsx(Sidebar, {}), _jsx(Box, { component: "main", sx: {
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - 240px)` },
                    ml: { sm: '240px' },
                    backgroundColor: 'background.default',
                }, children: _jsxs(Box, { sx: { mb: 4 }, children: [_jsxs(Typography, { variant: "h4", gutterBottom: true, children: ["Bienvenido, ", user.username] }), error && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error })), _jsxs(Box, { sx: { display: 'flex', gap: 2, mb: 4 }, children: [_jsx(TaskList, {}), _jsx(ReminderList, {})] }), _jsx(Box, { sx: { mb: 4 }, children: _jsx(TaskCalendar, { pages: filteredPages }) }), _jsx(Box, { sx: { mb: 4 }, children: _jsx(AISearch, {}) })] }) })] }));
};
export default Dashboard;
