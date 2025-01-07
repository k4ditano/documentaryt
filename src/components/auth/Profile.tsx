import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

const Profile: React.FC = () => {
  const { user, updateProfile, uploadAvatar, error } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        username: formData.username,
        email: formData.email,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      try {
        await uploadAvatar(e.target.files[0]);
      } catch (error) {
        console.error('Error al subir avatar:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!user) {
    return <Typography>Por favor inicia sesión para ver tu perfil.</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Perfil de Usuario
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={user.avatar}
            alt={user.username}
            sx={{ width: 100, height: 100 }}
          />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="avatar-upload"
            type="file"
            onChange={handleAvatarChange}
            disabled={loading}
          />
          <label htmlFor="avatar-upload">
            <IconButton
              color="primary"
              component="span"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: 'background.paper',
              }}
              disabled={loading}
            >
              <PhotoCamera />
            </IconButton>
          </label>
        </Box>
      </Box>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Nombre de usuario"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          disabled={!isEditing || loading}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Correo electrónico"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          disabled={!isEditing || loading}
          margin="normal"
        />

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          {!isEditing ? (
            <Button
              variant="contained"
              onClick={() => setIsEditing(true)}
              disabled={loading}
            >
              Editar Perfil
            </Button>
          ) : (
            <>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Guardar Cambios'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    username: user.username || '',
                    email: user.email || '',
                  });
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
            </>
          )}
        </Box>
      </form>
    </Box>
  );
};

export default Profile; 