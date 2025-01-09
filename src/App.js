import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import socketService from './services/socketService';
function App() {
    useEffect(() => {
        return () => {
            socketService.disconnect();
        };
    }, []);
    return (_jsx(Router, { children: _jsx(ThemeProvider, { children: _jsx(AuthProvider, { children: _jsx(AppRoutes, {}) }) }) }));
}
export default App;
