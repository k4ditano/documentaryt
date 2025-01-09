import { FC, useState, FormEvent, useEffect } from 'react';
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
  Alert,
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

const Login: FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, error: authError, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (authError) {
      setError(authError);
      setIsLoading(false);
    }
  }, [authError]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // La redirección se maneja en el primer useEffect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <MainContainer>
        <FormContainer>
          <Title>
            Iniciar sesión
          </Title>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
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
            <SubmitButton
              type="submit"
              variant="contained"
              disabled={isLoading}
              disableElevation
            >
              {isLoading ? (
                <>
                  <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </SubmitButton>
            <Box sx={{ textAlign: 'center' }}>
              <StyledRouterLink to="/register">
                ¿No tienes una cuenta? Regístrate
              </StyledRouterLink>
            </Box>
          </Box>
        </FormContainer>
      </MainContainer>
    </PageContainer>
  );
};

export default Login; 