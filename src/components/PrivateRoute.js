import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { loading, isAuthenticated } = useAuth();
    
    if (loading) {
        return null;
    }
    
    return isAuthenticated ? children : React.createElement(Navigate, {
        to: '/login',
        replace: true
    });
};

export default PrivateRoute;
