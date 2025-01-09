import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { loading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Cargando...</div>; // O tu componente de loading
    }

    if (!isAuthenticated) {
        // Guardamos la ubicación actual para redirigir después del login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default PrivateRoute;
