import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { adminAPI } from '../services/adminApi.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!username || !password) {
        setError('Username and password are required');
        setLoading(false);
        return;
      }

      const response = await adminAPI.login(username, password);
      
      if (response.token) {
        localStorage.setItem('adminToken', response.token);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa'
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ padding: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
              <LockIcon sx={{ fontSize: 48, color: '#27ae60', marginBottom: 1 }} />
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                Scrapair Admin
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Secure Admin Portal
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}

            {/* Login Form */}
            <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                variant="outlined"
                fullWidth
                disabled={loading}
                autoFocus
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                fullWidth
                disabled={loading}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: '#27ae60',
                  padding: '10px',
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: '#229954' }
                }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
              </Button>
            </Box>

            {/* Demo Credentials */}
            <Box sx={{ marginTop: 3, padding: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ display: 'block', marginBottom: 1, fontWeight: 'bold' }}>
                Demo Credentials:
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Username: <code>admin11</code>
              </Typography>
              <Typography variant="caption">
                Password: <code>asdqwe123</code>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;
