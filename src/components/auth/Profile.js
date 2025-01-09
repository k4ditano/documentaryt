import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Box, Button, TextField, Typography, Avatar, IconButton, CircularProgress, Alert, } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
const Profile = () => {
    const { user, updateProfile, uploadAvatar, error } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
    });
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile({
                username: formData.username,
                email: formData.email,
            });
            setIsEditing(false);
        }
        catch (error) {
            console.error('Error al actualizar perfil:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAvatarChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            setLoading(true);
            try {
                await uploadAvatar(e.target.files[0]);
            }
            catch (error) {
                console.error('Error al subir avatar:', error);
            }
            finally {
                setLoading(false);
            }
        }
    };
    if (!user) {
        return _jsx(Typography, { children: "Por favor inicia sesi\u00F3n para ver tu perfil." });
    }
    return (_jsxs(Box, { sx: { maxWidth: 600, mx: 'auto', p: 3 }, children: [_jsx(Typography, { variant: "h4", gutterBottom: true, children: "Perfil de Usuario" }), error && _jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }), _jsx(Box, { sx: { display: 'flex', alignItems: 'center', mb: 4 }, children: _jsxs(Box, { sx: { position: 'relative' }, children: [_jsx(Avatar, { src: user.avatar, alt: user.username, sx: { width: 100, height: 100 } }), _jsx("input", { accept: "image/*", style: { display: 'none' }, id: "avatar-upload", type: "file", onChange: handleAvatarChange, disabled: loading }), _jsx("label", { htmlFor: "avatar-upload", children: _jsx(IconButton, { color: "primary", component: "span", sx: {
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    backgroundColor: 'background.paper',
                                }, disabled: loading, children: _jsx(PhotoCamera, {}) }) })] }) }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx(TextField, { fullWidth: true, label: "Nombre de usuario", name: "username", value: formData.username, onChange: handleInputChange, disabled: !isEditing || loading, margin: "normal" }), _jsx(TextField, { fullWidth: true, label: "Correo electr\u00F3nico", name: "email", value: formData.email, onChange: handleInputChange, disabled: !isEditing || loading, margin: "normal" }), _jsx(Box, { sx: { mt: 3, display: 'flex', gap: 2 }, children: !isEditing ? (_jsx(Button, { variant: "contained", onClick: () => setIsEditing(true), disabled: loading, children: "Editar Perfil" })) : (_jsxs(_Fragment, { children: [_jsx(Button, { type: "submit", variant: "contained", color: "primary", disabled: loading, children: loading ? _jsx(CircularProgress, { size: 24 }) : 'Guardar Cambios' }), _jsx(Button, { variant: "outlined", onClick: () => {
                                        setIsEditing(false);
                                        setFormData({
                                            username: user.username || '',
                                            email: user.email || '',
                                        });
                                    }, disabled: loading, children: "Cancelar" })] })) })] })] }));
};
export default Profile;
