import { FC, useState, FormEvent } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputLabel,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const PageContainer = styled('div')({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#ffffff',
});

const MainContainer = styled(Container)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  maxWidth: '440px !important',
  padding: '0 20px',
});

const FormContainer = styled(Box)({
  width: '100%',
});

const Title = styled(Typography)({
  fontSize: '40px',
  lineHeight: '1.2',
  fontWeight: 700,
  color: 'rgb(55, 53, 47)',
  textAlign: 'center',
  marginBottom: '14px',
  fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
});

const StyledLabel = styled(InputLabel)({
  color: 'rgb(55, 53, 47)',
  fontSize: '12px',
  fontWeight: 500,
  marginBottom: '4px',
  '&.required::after': {
    content: '" *"',
    color: 'rgb(235, 87, 87)',
  },
});

const StyledTextField = styled(TextField)({
  marginBottom: '24px',
  '& .MuiInputBase-root': {
    backgroundColor: 'rgb(251, 251, 250)',
    borderRadius: '3px',
    fontSize: '14px',
    border: '1px solid rgba(55, 53, 47, 0.16)',
    transition: 'background-color 100ms ease-in, border-color 100ms ease-in',
    '&:hover': {
      borderColor: 'rgba(55, 53, 47, 0.3)',
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      borderColor: 'rgb(35, 131, 226)',
      boxShadow: 'rgb(35 131 226 / 14%) 0px 0px 0px 3px',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '& .MuiInputBase-input': {
    padding: '8px 10px',
    '&::placeholder': {
      color: 'rgba(55, 53, 47, 0.4)',
      opacity: 1,
    },
  },
});

const SubmitButton = styled(Button)({
  width: '100%',
  padding: '8px',
  backgroundColor: 'rgb(35, 131, 226)',
  color: '#ffffff',
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '14px',
  marginBottom: '12px',
  '&:hover': {
    backgroundColor: 'rgb(0, 117, 211)',
  },
  '&.Mui-disabled': {
    backgroundColor: 'rgba(35, 131, 226, 0.3)',
    color: '#ffffff',
  },
});

const StyledRouterLink = styled(RouterLink)({
  color: 'rgb(35, 131, 226)',
  textDecoration: 'none',
  fontSize: '14px',
  '&:hover': {
    textDecoration: 'underline',
  },
});

const Register: FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError('Error al registrar el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <MainContainer>
        <FormContainer>
          <Title>
            Crear cuenta
          </Title>
          <Box component="form" onSubmit={handleSubmit}>
            <StyledLabel className="required">
              Nombre
            </StyledLabel>
            <StyledTextField
              fullWidth
              placeholder="Ingresa tu nombre"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              error={!!error}
              variant="outlined"
              InputProps={{
                disableUnderline: true,
              }}
            />
            <StyledLabel className="required">
              Correo electrónico
            </StyledLabel>
            <StyledTextField
              fullWidth
              placeholder="Ingresa tu correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              error={!!error}
              variant="outlined"
              InputProps={{
                disableUnderline: true,
              }}
            />
            <StyledLabel className="required">
              Contraseña
            </StyledLabel>
            <StyledTextField
              fullWidth
              placeholder="Ingresa tu contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              error={!!error}
              variant="outlined"
              InputProps={{
                disableUnderline: true,
              }}
            />
            <StyledLabel className="required">
              Confirmar contraseña
            </StyledLabel>
            <StyledTextField
              fullWidth
              placeholder="Confirma tu contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              error={!!error}
              helperText={error}
              variant="outlined"
              InputProps={{
                disableUnderline: true,
              }}
            />
            <SubmitButton
              type="submit"
              variant="contained"
              disabled={isLoading}
              disableElevation
            >
              {isLoading ? (
                <>
                  <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                  Registrando...
                </>
              ) : (
                'Registrarse'
              )}
            </SubmitButton>
            <Box sx={{ textAlign: 'center' }}>
              <StyledRouterLink to="/login">
                ¿Ya tienes una cuenta? Inicia sesión
              </StyledRouterLink>
            </Box>
          </Box>
        </FormContainer>
      </MainContainer>
    </PageContainer>
  );
};

export default Register; 