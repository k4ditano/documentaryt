import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Container, Box, TextField, Button, Typography, CircularProgress, InputLabel, } from '@mui/material';
import { useAuth } from '../context/AuthContext';
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
const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
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
        }
        catch (err) {
            setError('Error al registrar el usuario');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx(PageContainer, { children: _jsx(MainContainer, { children: _jsxs(FormContainer, { children: [_jsx(Title, { children: "Crear cuenta" }), _jsxs(Box, { component: "form", onSubmit: handleSubmit, children: [_jsx(StyledLabel, { className: "required", children: "Nombre" }), _jsx(StyledTextField, { fullWidth: true, placeholder: "Ingresa tu nombre", type: "text", value: name, onChange: (e) => setName(e.target.value), required: true, error: !!error, variant: "outlined", InputProps: {
                                    disableUnderline: true,
                                } }), _jsx(StyledLabel, { className: "required", children: "Correo electr\u00F3nico" }), _jsx(StyledTextField, { fullWidth: true, placeholder: "Ingresa tu correo electr\u00F3nico", type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, error: !!error, variant: "outlined", InputProps: {
                                    disableUnderline: true,
                                } }), _jsx(StyledLabel, { className: "required", children: "Contrase\u00F1a" }), _jsx(StyledTextField, { fullWidth: true, placeholder: "Ingresa tu contrase\u00F1a", type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, error: !!error, variant: "outlined", InputProps: {
                                    disableUnderline: true,
                                } }), _jsx(StyledLabel, { className: "required", children: "Confirmar contrase\u00F1a" }), _jsx(StyledTextField, { fullWidth: true, placeholder: "Confirma tu contrase\u00F1a", type: "password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), required: true, error: !!error, helperText: error, variant: "outlined", InputProps: {
                                    disableUnderline: true,
                                } }), _jsx(SubmitButton, { type: "submit", variant: "contained", disabled: isLoading, disableElevation: true, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(CircularProgress, { size: 16, color: "inherit", sx: { mr: 1 } }), "Registrando..."] })) : ('Registrarse') }), _jsx(Box, { sx: { textAlign: 'center' }, children: _jsx(StyledRouterLink, { to: "/login", children: "\u00BFYa tienes una cuenta? Inicia sesi\u00F3n" }) })] })] }) }) }));
};
export default Register;
