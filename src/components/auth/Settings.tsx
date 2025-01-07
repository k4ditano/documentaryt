import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Sidebar';

const ContentContainer = styled('div')({
  flex: 1,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#ffffff',
});

const MainContent = styled('div')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '900px',
  width: '100%',
  margin: '0 auto',
  padding: '32px 96px',
  '@media (max-width: 768px)': {
    padding: '24px',
  },
});

const TopBar = styled('div')({
  display: 'flex',
  alignItems: 'center',
  padding: '10px 12px',
  borderBottom: '1px solid rgba(55, 53, 47, 0.09)',
  gap: '8px',
  minHeight: '45px',
  backgroundColor: '#ffffff',
});

const SettingSection = styled('div')({
  padding: '24px 14px',
  marginBottom: '8px',
  borderRadius: '3px',
  '&:hover': {
    backgroundColor: 'rgba(55, 53, 47, 0.03)',
  },
});

const ActionButton = styled(Button)({
  color: 'rgba(55, 53, 47, 0.65)',
  textTransform: 'none',
  padding: '2px 14px',
  justifyContent: 'flex-start',
  minHeight: '28px',
  backgroundColor: 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(55, 53, 47, 0.08)',
  },
  '&.Mui-disabled': {
    backgroundColor: 'transparent',
  },
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(55, 53, 47, 0.16)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(55, 53, 47, 0.32)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(55, 53, 47, 0.5)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(55, 53, 47, 0.6)',
  },
});

const StyledSwitch = styled(Switch)({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#2ecc71',
    '&:hover': {
      backgroundColor: 'rgba(46, 204, 113, 0.08)',
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: '#2ecc71',
  },
});

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    darkMode: false,
    emailNotifications: true,
    desktopNotifications: false,
    language: 'es',
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Aquí implementaremos la actualización de ajustes
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Configuración guardada correctamente');
      // TODO: Implementar guardado real
    } catch (error) {
      console.error('Error al guardar los ajustes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fbfbfa' }}>
      <Sidebar />
      <ContentContainer>
        <TopBar>
          <IconButton 
            onClick={handleBack}
            sx={{ 
              color: 'rgba(55, 53, 47, 0.65)',
              '&:hover': {
                backgroundColor: 'rgba(55, 53, 47, 0.08)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Typography 
            sx={{ 
              flex: 1, 
              color: '#37352f',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Ajustes
          </Typography>

          <ActionButton
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : 'Guardar cambios'}
          </ActionButton>
        </TopBar>

        <MainContent>
          {(error || successMessage) && (
            <Box 
              sx={{ 
                mb: 3,
                p: '8px 14px',
                color: successMessage ? '#27ae60' : '#e74c3c',
                fontSize: '14px',
              }}
            >
              {successMessage || error}
            </Box>
          )}

          <SettingSection>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar 
                sx={{ 
                  width: 64, 
                  height: 64, 
                  bgcolor: 'rgba(55, 53, 47, 0.4)',
                  mr: 2,
                  fontSize: '24px',
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography sx={{ color: '#37352f', fontSize: '14px', fontWeight: 500 }}>
                  {user?.name}
                </Typography>
                <Typography sx={{ color: 'rgba(55, 53, 47, 0.65)', fontSize: '14px' }}>
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              color: '#37352f',
              fontSize: '14px',
              fontWeight: 500,
            }}>
              <PersonIcon sx={{ mr: 1, fontSize: 20 }} /> Perfil
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <StyledTextField
                size="small"
                label="Nombre"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                fullWidth
                variant="outlined"
              />
              <StyledTextField
                size="small"
                label="Email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                fullWidth
                variant="outlined"
              />
            </Box>
          </SettingSection>

          <SettingSection>
            <Typography sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              color: '#37352f',
              fontSize: '14px',
              fontWeight: 500,
            }}>
              <PaletteIcon sx={{ mr: 1, fontSize: 20 }} /> Apariencia
            </Typography>
            <FormControlLabel
              control={
                <StyledSwitch
                  checked={settings.darkMode}
                  onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                />
              }
              label={
                <Typography sx={{ fontSize: '14px', color: 'rgba(55, 53, 47, 0.65)' }}>
                  Modo oscuro
                </Typography>
              }
            />
          </SettingSection>

          <SettingSection>
            <Typography sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              color: '#37352f',
              fontSize: '14px',
              fontWeight: 500,
            }}>
              <NotificationsIcon sx={{ mr: 1, fontSize: 20 }} /> Notificaciones
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <StyledSwitch
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '14px', color: 'rgba(55, 53, 47, 0.65)' }}>
                    Recibir notificaciones por email
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <StyledSwitch
                    checked={settings.desktopNotifications}
                    onChange={(e) => setSettings({ ...settings, desktopNotifications: e.target.checked })}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '14px', color: 'rgba(55, 53, 47, 0.65)' }}>
                    Notificaciones de escritorio
                  </Typography>
                }
              />
            </Box>
          </SettingSection>

          <SettingSection>
            <Typography sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              color: '#37352f',
              fontSize: '14px',
              fontWeight: 500,
            }}>
              <LanguageIcon sx={{ mr: 1, fontSize: 20 }} /> Idioma
            </Typography>
            <StyledTextField
              select
              size="small"
              fullWidth
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              SelectProps={{
                native: true,
              }}
              variant="outlined"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </StyledTextField>
          </SettingSection>
        </MainContent>
      </ContentContainer>
    </Box>
  );
};

export default Settings; 