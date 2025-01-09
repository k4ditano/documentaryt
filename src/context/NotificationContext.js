import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
const NotificationContext = createContext(undefined);
export const NotificationProvider = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('info');
    const handleClose = () => {
        setOpen(false);
    };
    const showNotification = (message, severity) => {
        setMessage(message);
        setSeverity(severity);
        setOpen(true);
    };
    const showSuccess = (message) => showNotification(message, 'success');
    const showError = (message) => showNotification(message, 'error');
    const showInfo = (message) => showNotification(message, 'info');
    const showWarning = (message) => showNotification(message, 'warning');
    return (_jsxs(NotificationContext.Provider, { value: { showSuccess, showError, showInfo, showWarning }, children: [children, _jsx(Snackbar, { open: open, autoHideDuration: 6000, onClose: handleClose, children: _jsx(Alert, { onClose: handleClose, severity: severity, sx: { width: '100%' }, children: message }) })] }));
};
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
export default NotificationContext;
