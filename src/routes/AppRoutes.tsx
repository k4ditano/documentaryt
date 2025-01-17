import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { AppProvider } from '../context/AppContext';
import { NotificationProvider } from '../context/NotificationContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Profile from '../components/auth/Profile';
import Settings from '../components/auth/Settings';
import TaskCalendar from '../components/TaskCalendar';
import TaskList from '../components/TaskList';
import ReminderList from '../components/ReminderList';
import AISearch from '../components/AISearch';
import PrivateRoute from '../components/PrivateRoute';
import { useApp } from '../context/AppContext';

const AppContent: React.FC = () => {
  const { pages } = useApp();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <PrivateRoute>
            <TaskCalendar pages={pages} />
          </PrivateRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <PrivateRoute>
            <TaskList />
          </PrivateRoute>
        }
      />
      <Route
        path="/reminders"
        element={
          <PrivateRoute>
            <ReminderList />
          </PrivateRoute>
        }
      />
      <Route
        path="/search"
        element={
          <PrivateRoute>
            <AISearch />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <AppProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AppProvider>
    </LocalizationProvider>
  );
};

export default AppRoutes; 