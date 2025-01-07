import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import type { Page } from '../types';
import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItem,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Description as PageIcon,
  Folder as FolderIcon,
  Task as TaskIcon,
} from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import { styled } from '@mui/material/styles';
import { Task, taskService } from '../services/taskService';
import MainLayout from '../components/layout/MainLayout';

const ContentContainer = styled('div')({
  flex: 1,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#ffffff',
  width: '100%'
});

const MainContent = styled('div')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '900px',
  width: '100%',
  margin: '0 auto',
  padding: '32px',
  '@media (max-width: 1024px)': {
    padding: '24px',
  },
  '@media (max-width: 900px)': {
    padding: '16px',
  }
});

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { pages, folders, isLoading } = useApp();
  const [recentPages, setRecentPages] = useState<Page[]>([]);
  const [recentFolders, setRecentFolders] = useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);

  const formatDate = (date: string | undefined) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString();
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '';
    }
  };

  useEffect(() => {
    console.log('Estado del usuario:', user);
    console.log('¿Usuario tiene nombre?:', user?.name);
    
    const sortedPages = [...pages].sort((a, b) => {
      const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return dateB - dateA;
    });
    setRecentPages(sortedPages.slice(0, 5));

    const sortedFolders = [...folders].sort((a, b) => {
      const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return dateB - dateA;
    });
    setRecentFolders(sortedFolders.slice(0, 5));

    // Cargar próximas tareas
    loadUpcomingTasks();
  }, [pages, folders, user]);

  const getPriorityWeight = (priority: string): number => {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  const loadUpcomingTasks = async () => {
    try {
      const tasks = await taskService.getAllTasks();
      const now = new Date();
      const filteredTasks = tasks
        .filter(task => 
          task.status !== 'completed' && 
          task.due_date && 
          new Date(task.due_date) > now
        )
        .sort((a, b) => {
          // Primero ordenar por prioridad
          const priorityDiff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
          if (priorityDiff !== 0) return priorityDiff;

          // Si tienen la misma prioridad, ordenar por fecha
          if (!a.due_date || !b.due_date) return 0;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        })
        .slice(0, 5);
      setUpcomingTasks(filteredTasks);
    } catch (error) {
      console.error('Error al cargar las próximas tareas:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatTaskDate = (date: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    });
  };

  const renderContent = () => (
    <MainContent>
      <Box sx={{ 
        mb: { xs: 3, sm: 4, md: 6 }
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '1.8rem', sm: '2rem', md: '2.5rem' },
            color: '#37352f',
            mb: { xs: 1, sm: 2 }
          }}
        >
          Bienvenido{user?.name ? `, ${user.name}` : ''} 👋
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#6b7280',
            fontSize: { xs: '1rem', sm: '1.1rem' }
          }}
        >
          Aquí tienes un resumen de tu espacio de trabajo
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        <Grid item xs={12}>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, sm: 3 },
              height: '100%',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: 2,
              bgcolor: '#ffffff',
              mb: { xs: 2, sm: 3, md: 4 }
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#37352f'
                }}
              >
                Próximas tareas
              </Typography>
            </Box>
            <List sx={{ py: 0 }}>
              {upcomingTasks.map(task => (
                <ListItemButton
                  key={task.id}
                  component={Link}
                  to="/tasks"
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <TaskIcon sx={{ color: '#6b7280' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {task.title}
                        <Chip 
                          label={task.priority} 
                          size="small" 
                          color={getPriorityColor(task.priority)}
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    secondary={`Fecha límite: ${formatTaskDate(task.due_date!)}`}
                    primaryTypographyProps={{
                      sx: {
                        fontWeight: 500,
                        color: '#37352f',
                      }
                    }}
                    secondaryTypographyProps={{
                      sx: {
                        color: '#6b7280',
                      }
                    }}
                  />
                </ListItemButton>
              ))}
              {upcomingTasks.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No hay tareas próximas"
                    secondary="Crea una nueva tarea para empezar"
                    primaryTypographyProps={{
                      sx: {
                        color: '#6b7280',
                      }
                    }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, sm: 3 },
              height: '100%',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: 2,
              bgcolor: '#ffffff',
              mb: { xs: 2, sm: 0 }
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#37352f'
                }}
              >
                Últimas páginas
              </Typography>
            </Box>
            <List sx={{ py: 0 }}>
              {recentPages.map(page => (
                <ListItemButton
                  key={page.id}
                  component={Link}
                  to={`/page/${page.id}`}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <PageIcon sx={{ color: '#6b7280' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={page.title}
                    secondary={formatDate(page.updated_at)}
                    primaryTypographyProps={{
                      sx: {
                        fontWeight: 500,
                        color: '#37352f',
                      }
                    }}
                    secondaryTypographyProps={{
                      sx: {
                        color: '#6b7280',
                      }
                    }}
                  />
                </ListItemButton>
              ))}
              {recentPages.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No hay páginas recientes"
                    secondary="Crea una nueva página para empezar"
                    primaryTypographyProps={{
                      sx: {
                        color: '#6b7280',
                      }
                    }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, sm: 3 },
              height: '100%',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: 2,
              bgcolor: '#ffffff'
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#37352f'
                }}
              >
                Carpetas recientes
              </Typography>
            </Box>
            <List sx={{ py: 0 }}>
              {recentFolders.map(folder => (
                <ListItemButton
                  key={folder.id}
                  component={Link}
                  to={`/folder/${folder.id}`}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <FolderIcon sx={{ color: '#6b7280' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={folder.name}
                    secondary={formatDate(folder.updated_at)}
                    primaryTypographyProps={{
                      sx: {
                        fontWeight: 500,
                        color: '#37352f',
                      }
                    }}
                    secondaryTypographyProps={{
                      sx: {
                        color: '#6b7280',
                      }
                    }}
                  />
                </ListItemButton>
              ))}
              {recentFolders.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No hay carpetas recientes"
                    secondary="Crea una nueva carpeta para organizar tu contenido"
                    primaryTypographyProps={{
                      sx: {
                        color: '#6b7280',
                      }
                    }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </MainContent>
  );

  return (
    <MainLayout>
      <ContentContainer>
        {isLoading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}>
            <CircularProgress />
          </Box>
        ) : renderContent()}
      </ContentContainer>
    </MainLayout>
  );
};

export default Dashboard; 