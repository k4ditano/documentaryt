import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import TaskList from '../components/TaskList';
import TaskCalendar from '../components/TaskCalendar';
import ReminderList from '../components/ReminderList';
import AISearch from '../components/AISearch';
import type { Page } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { pages, folders, refreshPages, refreshFolders } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filteredPages, setFilteredPages] = useState<Page[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([refreshPages(), refreshFolders()]);
      } catch (error) {
        console.error('Error al cargar los datos:', error);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshPages, refreshFolders]);

  useEffect(() => {
    setFilteredPages(pages);
  }, [pages]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Por favor inicia sesión para ver el dashboard.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          ml: { sm: '240px' },
          backgroundColor: 'background.default',
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Bienvenido, {user.username}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <TaskList />
            <ReminderList />
          </Box>

          <Box sx={{ mb: 4 }}>
            <TaskCalendar pages={filteredPages} />
          </Box>

          <Box sx={{ mb: 4 }}>
            <AISearch />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard; 