import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Box, Container, Paper, Typography, TextField, Button, Alert, Grid, Switch, FormControlLabel, Divider, } from '@mui/material';
import Sidebar from '../Sidebar';
const Settings = () => {
    const { user, error, clearError, updateProfile, updatePassword } = useAuth();
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        emailNotifications: true,
    });
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [validationError, setValidationError] = useState(null);
    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        const newValue = name === 'emailNotifications' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: newValue }));
        if (error)
            clearError();
        if (validationError)
            setValidationError(null);
        if (successMessage)
            setSuccessMessage(null);
    };
    const validateForm = () => {
        if (formData.newPassword && formData.newPassword.length < 6) {
            setValidationError('La nueva contraseña debe tener al menos 6 caracteres');
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setValidationError('Las contraseñas no coinciden');
            return false;
        }
        return true;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        try {
            setLoading(true);
            // Actualizar perfil
            if (formData.username !== user?.username) {
                await updateProfile({ username: formData.username });
            }
            // Actualizar contraseña
            if (formData.currentPassword && formData.newPassword) {
                await updatePassword(formData.currentPassword, formData.newPassword);
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                }));
            }
            setSuccessMessage('Configuración actualizada correctamente');
        }
        catch (error) {
            setValidationError(error instanceof Error ? error.message : 'Error al actualizar la configuración');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(Box, { sx: { display: 'flex', minHeight: '100vh' }, children: [_jsx(Sidebar, {}), _jsx(Box, { component: "main", sx: {
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - 240px)` },
                    ml: { sm: '240px' },
                    backgroundColor: 'background.default',
                }, children: _jsx(Container, { maxWidth: "md", children: _jsxs(Paper, { sx: { p: 4, mt: 4 }, children: [_jsx(Typography, { variant: "h4", gutterBottom: true, children: "Configuraci\u00F3n" }), (error || validationError || successMessage) && (_jsx(Alert, { severity: successMessage ? 'success' : 'error', sx: { mb: 3 }, onClose: () => {
                                    if (error)
                                        clearError();
                                    if (validationError)
                                        setValidationError(null);
                                    if (successMessage)
                                        setSuccessMessage(null);
                                }, children: successMessage || error || validationError })), _jsx(Box, { component: "form", onSubmit: handleSubmit, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, children: _jsx(Typography, { variant: "h6", gutterBottom: true, children: "Informaci\u00F3n de la cuenta" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "Nombre de usuario", name: "username", value: formData.username, onChange: handleChange, disabled: loading }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "Correo electr\u00F3nico", name: "email", value: formData.email, disabled: true }) }), _jsxs(Grid, { item: true, xs: 12, children: [_jsx(Divider, { sx: { my: 2 } }), _jsx(Typography, { variant: "h6", gutterBottom: true, children: "Cambiar contrase\u00F1a" })] }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "Contrase\u00F1a actual", name: "currentPassword", type: "password", value: formData.currentPassword, onChange: handleChange, disabled: loading }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "Nueva contrase\u00F1a", name: "newPassword", type: "password", value: formData.newPassword, onChange: handleChange, disabled: loading }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "Confirmar nueva contrase\u00F1a", name: "confirmPassword", type: "password", value: formData.confirmPassword, onChange: handleChange, disabled: loading }) }), _jsxs(Grid, { item: true, xs: 12, children: [_jsx(Divider, { sx: { my: 2 } }), _jsx(Typography, { variant: "h6", gutterBottom: true, children: "Notificaciones" })] }), _jsx(Grid, { item: true, xs: 12, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: formData.emailNotifications, onChange: handleChange, name: "emailNotifications", color: "primary", disabled: loading }), label: "Recibir notificaciones por correo electr\u00F3nico" }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Button, { type: "submit", variant: "contained", size: "large", disabled: loading, sx: { mt: 2 }, children: loading ? 'Guardando...' : 'Guardar cambios' }) })] }) })] }) }) })] }));
};
export default Settings;
