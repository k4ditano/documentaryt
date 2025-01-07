import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, IconButton, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SidebarComponent from '../Sidebar';
import NotificationCenter from '../NotificationCenter';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainContainer = styled('div')`
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

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <MainContainer>
      <SidebarComponent open={mobileOpen} onClose={handleDrawerToggle} />
      
      {isMobile && (
        <TopBar>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              color: 'rgba(0, 0, 0, 0.54)',
              padding: '12px',
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ padding: '12px' }}>
            <NotificationCenter />
          </Box>
        </TopBar>
      )}

      {!isMobile && (
        <Box
          sx={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            zIndex: 1200,
          }}
        >
          <NotificationCenter />
        </Box>
      )}

      <MainContent>
        {children}
      </MainContent>
    </MainContainer>
  );
};

export default MainLayout; 