import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import Sidebar from '../Sidebar';

const Settings: React.FC = () => {
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    const newValue = name === 'emailNotifications' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
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
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Error al actualizar la configuración');
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
              Configuración
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
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Información de la cuenta
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre de usuario"
                    name="username"
                    value={formData.username}
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
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
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
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Notificaciones
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.emailNotifications}
                        onChange={handleChange}
                        name="emailNotifications"
                        color="primary"
                        disabled={loading}
                      />
                    }
                    label="Recibir notificaciones por correo electrónico"
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

export default Settings; 