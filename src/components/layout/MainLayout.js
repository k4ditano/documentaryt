import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, IconButton, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SidebarComponent from '../Sidebar';
import NotificationCenter from '../NotificationCenter';
const MainContainer = styled('div') `
  display: flex;
  min-height: 100vh;
`;
const MainContent = styled('div')(({ theme }) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
        marginLeft: '280px',
    },
    [theme.breakpoints.down('md')]: {
        marginLeft: 0,
        paddingTop: '48px',
    },
}));
const TopBar = styled(Box)(({ theme }) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '48px',
    backgroundColor: '#fff',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 8px',
    zIndex: 1200,
    [theme.breakpoints.down('md')]: {
        display: 'flex',
    },
}));
const MainLayout = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };
    return (_jsxs(MainContainer, { children: [_jsx(SidebarComponent, { open: mobileOpen, onClose: handleDrawerToggle }), isMobile && (_jsxs(TopBar, { children: [_jsx(IconButton, { onClick: handleDrawerToggle, sx: {
                            color: 'rgba(0, 0, 0, 0.54)',
                            padding: '12px',
                        }, children: _jsx(MenuIcon, {}) }), _jsx(Box, { sx: { padding: '12px' }, children: _jsx(NotificationCenter, {}) })] })), !isMobile && (_jsx(Box, { sx: {
                    position: 'fixed',
                    top: '16px',
                    right: '16px',
                    zIndex: 1200,
                }, children: _jsx(NotificationCenter, {}) })), _jsx(MainContent, { children: children })] }));
};
export default MainLayout;
