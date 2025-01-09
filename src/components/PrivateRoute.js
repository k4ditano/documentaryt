import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { loading, isAuthenticated } = useAuth();
    
    if (loading) {
        return null;
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace={true} />;
    }
    
    return children;
};

export default PrivateRoute;
