import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  IconButton,
  Grid,
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import Sidebar from '../Sidebar';

const Profile: React.FC = () => {
  const { user, error, clearError, updateProfile, updatePassword, uploadAvatar } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
    if (validationError) setValidationError(null);
    if (successMessage) setSuccessMessage(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      // Actualizar perfil
      if (formData.name !== user?.name) {
        await updateProfile({ name: formData.name });
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

      setSuccessMessage('Perfil actualizado correctamente');
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      await uploadAvatar(file);
      setSuccessMessage('Avatar actualizado correctamente');
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Error al actualizar el avatar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          ml: { sm: '240px' },
          backgroundColor: 'background.default',
        }}
      >
        <Container maxWidth="md">
          <Paper sx={{ p: 4, mt: 4 }}>
            <Typography variant="h4" gutterBottom>
              Perfil de Usuario
            </Typography>

            {(error || validationError || successMessage) && (
              <Alert
                severity={successMessage ? 'success' : 'error'}
                sx={{ mb: 3 }}
                onClose={() => {
                  if (error) clearError();
                  if (validationError) setValidationError(null);
                  if (successMessage) setSuccessMessage(null);
                }}
              >
                {successMessage || error || validationError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={user?.avatar}
                      sx={{ width: 100, height: 100 }}
                    >
                      {user?.name?.[0]}
                    </Avatar>
                    <IconButton
                      color="primary"
                      aria-label="subir avatar"
                      component="label"
                      disabled={loading}
                      sx={{
                        position: 'absolute',
                        bottom: -10,
                        right: -10,
                        backgroundColor: 'background.paper',
                        '&:hover': { backgroundColor: 'background.paper' },
                      }}
                    >
                      <input
                        hidden
                        accept="image/*"
                        type="file"
                        onChange={handleAvatarChange}
                      />
                      <PhotoCameraIcon />
                    </IconButton>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Correo electrónico"
                    name="email"
                    value={formData.email}
                    disabled
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Cambiar contraseña
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contraseña actual"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nueva contraseña"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirmar nueva contraseña"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ mt: 2 }}
                  >
                    {loading ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default Profile; 