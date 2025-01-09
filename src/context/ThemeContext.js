import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
const ThemeContext = createContext({
    mode: 'light',
    toggleTheme: () => { },
});
export const useTheme = () => useContext(ThemeContext);
export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('themeMode');
        return savedMode || 'light';
    });
    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);
    const theme = React.useMemo(() => createTheme({
        palette: {
            mode,
        },
    }), [mode]);
    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };
    return (_jsx(ThemeContext.Provider, { value: { mode, toggleTheme }, children: _jsxs(MuiThemeProvider, { theme: theme, children: [_jsx(CssBaseline, {}), children] }) }));
};
