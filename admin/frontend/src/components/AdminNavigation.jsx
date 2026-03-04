import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Box, Drawer, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import RateReviewIcon from '@mui/icons-material/RateReview';
import WarningIcon from '@mui/icons-material/Warning';
import HistoryIcon from '@mui/icons-material/History';
import CategoryIcon from '@mui/icons-material/Category';
import { adminAPI } from '../services/adminApi.jsx';

const AdminNavigation = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('adminToken');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    adminAPI.logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: DashboardIcon },
    { label: 'Users', path: '/admin/users', icon: PeopleIcon },
    { label: 'Ratings', path: '/admin/ratings', icon: RateReviewIcon },
    { label: 'Reports', path: '/admin/reports', icon: WarningIcon },
    { label: 'Categories', path: '/admin/categories', icon: CategoryIcon },
    { label: 'System Logs', path: '/admin/logs', icon: HistoryIcon }
  ];

  const drawer = (
    <Box sx={{ width: 250 }}>
      <List>
        <ListItem sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <SecurityIcon sx={{ color: '#27ae60' }} />
            <ListItemText primary="Admin Menu" primaryTypographyProps={{ fontWeight: 'bold' }} />
          </Box>
        </ListItem>
        <Divider />
        {menuItems.map((item) => (
          <ListItem
            key={item.path}
            onClick={() => {
              navigate(item.path);
              setDrawerOpen(false);
            }}
            sx={{
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'rgba(39, 174, 96, 0.1)' },
              py: 1.5
            }}
          >
            <item.icon sx={{ mr: 2, color: '#27ae60' }} />
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#2c3e50' }}>
      <Toolbar>
        {isLoggedIn && (
          <Button
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </Button>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1, cursor: 'pointer' }} onClick={() => isLoggedIn && navigate('/admin/dashboard')}>
          <SecurityIcon sx={{ fontSize: 32, color: '#27ae60' }} />
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>Scrapair Admin</span>
        </Box>
        {isLoggedIn && (
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              backgroundColor: 'rgba(231, 76, 60, 0.2)',
              '&:hover': { backgroundColor: 'rgba(231, 76, 60, 0.3)' }
            }}
          >
            Logout
          </Button>
        )}
      </Toolbar>
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default AdminNavigation;
