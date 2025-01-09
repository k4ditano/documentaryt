import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography, IconButton, } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Close as CloseIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        width: '100%',
        maxWidth: 500,
        borderRadius: '8px'
    }
}));
const DialogHeader = styled(DialogTitle)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    color: 'rgb(55, 53, 47)',
    borderBottom: '1px solid rgba(55, 53, 47, 0.09)',
    '& .MuiIconButton-root': {
        color: 'rgb(55, 53, 47)',
        padding: '8px',
        '&:hover': {
            backgroundColor: 'rgba(55, 53, 47, 0.08)'
        }
    }
}));
const ReminderDialog = ({ open, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [reminderTime, setReminderTime] = useState(new Date());
    const [error, setError] = useState(null);
    const handleSubmit = () => {
        if (!title.trim()) {
            setError('El título es obligatorio');
            return;
        }
        if (!reminderTime) {
            setError('La fecha y hora son obligatorias');
            return;
        }
        if (reminderTime < new Date()) {
            setError('La fecha debe ser futura');
            return;
        }
        onSubmit({
            title: title.trim(),
            message: message.trim(),
            reminderTime
        });
        handleClose();
    };
    const handleClose = () => {
        setTitle('');
        setMessage('');
        setReminderTime(new Date());
        setError(null);
        onClose();
    };
    return (_jsxs(StyledDialog, { open: open, onClose: handleClose, fullWidth: true, children: [_jsxs(DialogHeader, { children: ["Crear Recordatorio", _jsx(IconButton, { onClick: handleClose, size: "small", children: _jsx(CloseIcon, {}) })] }), _jsx(DialogContent, { sx: { pt: 3 }, children: _jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 3 }, children: [_jsx(TextField, { label: "T\u00EDtulo", value: title, onChange: (e) => setTitle(e.target.value), fullWidth: true, variant: "outlined", placeholder: "Ej: Llamar al m\u00E9dico", error: error === 'El título es obligatorio', helperText: error === 'El título es obligatorio' ? error : '' }), _jsx(TextField, { label: "Mensaje (opcional)", value: message, onChange: (e) => setMessage(e.target.value), fullWidth: true, variant: "outlined", multiline: true, rows: 3, placeholder: "A\u00F1ade detalles adicionales..." }), _jsx(DateTimePicker, { label: "Fecha y hora", value: reminderTime, onChange: (newValue) => setReminderTime(newValue), slotProps: {
                                textField: {
                                    fullWidth: true,
                                    variant: 'outlined',
                                    error: error === 'La fecha debe ser futura',
                                    helperText: error === 'La fecha debe ser futura' ? error : ''
                                }
                            } }), error && error !== 'El título es obligatorio' && error !== 'La fecha debe ser futura' && (_jsx(Typography, { color: "error", variant: "caption", children: error }))] }) }), _jsxs(DialogActions, { sx: { p: 2, gap: 1 }, children: [_jsx(Button, { onClick: handleClose, sx: { color: 'rgb(55, 53, 47)' }, children: "Cancelar" }), _jsx(Button, { onClick: handleSubmit, variant: "contained", sx: {
                            bgcolor: '#2ecc71',
                            '&:hover': {
                                bgcolor: '#27ae60'
                            }
                        }, children: "Crear Recordatorio" })] })] }));
};
export default ReminderDialog;
