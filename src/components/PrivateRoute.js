import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { loading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (loading) {
        return React.createElement('div', null, 'Cargando...');
    }

    if (!isAuthenticated) {
        return React.createElement(Navigate, {
            to: '/login',
            state: { from: location },
            replace: true
        });
    }

    return children;
};

export default PrivateRoute;
