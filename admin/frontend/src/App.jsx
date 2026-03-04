import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import AdminNavigation from './components/AdminNavigation.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminUserDetailsPage from './pages/AdminUserDetailsPage.jsx';
import AdminRatingsPage from './pages/AdminRatingsPage.jsx';
import AdminReportsPage from './pages/AdminReportsPage.jsx';
import AdminCategoriesPage from './pages/AdminCategoriesPage.jsx';
import AdminSystemLogsPage from './pages/AdminSystemLogsPage.jsx';

const theme = createTheme({
  palette: {
    primary: {
      main: '#27ae60'
    },
    secondary: {
      main: '#3498db'
    },
    background: {
      default: '#f8f9fa'
    }
  },
  typography: {
    fontFamily: "'Roboto', sans-serif"
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AdminNavigation />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <ProtectedRoute>
                <AdminUserDetailsPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/ratings"
            element={
              <ProtectedRoute>
                <AdminRatingsPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute>
                <AdminReportsPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute>
                <AdminCategoriesPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute>
                <AdminSystemLogsPage />
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
