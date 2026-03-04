import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { format } from 'date-fns';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 50;

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5498/api';
      const [usersRes, statsRes] = await Promise.all([
        fetch(`${apiUrl}/admin/users?${queryParams}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/admin/statistics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!usersRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const usersData = await usersRes.json();
      const statsData = await statsRes.json();

      setUsers(usersData.users || []);
      setStats(statsData.data || {});
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleVerifyUser = async (userId, currentStatus) => {
    const action = currentStatus ? 'unverify' : 'verify';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5498/api'}/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isVerified: !currentStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update verification status');
      }

      await fetchData();
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to update verification status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all their data? This cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5498/api'}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      await fetchData();
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const getUserTypeColor = (type) => {
    switch (type) {
      case 'business':
        return '#2976c3';
      case 'recycler':
        return '#27ae60';
      case 'artist':
        return '#e67e22';
      default:
        return '#7f8c8d';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '40px 0' }}>
      <Container>
        {/* Header */}
        <Box sx={{ marginBottom: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            Admin Dashboard - Users Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#7f8c8d', marginTop: 1 }}>
            View and manage all registered users in the system
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ marginBottom: 3 }}>{error}</Alert>}

        {/* Statistics Cards */}
        {stats && (
          <Grid container spacing={2} sx={{ marginBottom: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                    {stats.totalUsers || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Materials Posted
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#27ae60' }}>
                    {stats.totalMaterials || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Active Users
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2980b9' }}>
                    {users.filter(u => u.isActive).length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Users Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Alert severity="info">No users found</Alert>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#2c3e50' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Phone</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Specialization</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Verified</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Joined</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{user.id}</TableCell>
                    <TableCell sx={{ fontWeight: '500' }}>{user.name || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span style={{
                        backgroundColor: getUserTypeColor(user.type) + '20',
                        color: getUserTypeColor(user.type),
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        textTransform: 'capitalize'
                      }}>
                        {user.type}
                      </span>
                    </TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>{user.specialization || 'N/A'}</TableCell>
                    <TableCell>
                      <span style={{
                        backgroundColor: user.isActive ? '#d4edda' : '#f8d7da',
                        color: user.isActive ? '#155724' : '#721c24',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontSize: '0.85rem'
                      }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span style={{
                        backgroundColor: user.isVerified ? '#d4edda' : '#f8d7da',
                        color: user.isVerified ? '#155724' : '#721c24',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontSize: '0.85rem'
                      }}>
                        {user.isVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </TableCell>
                    <TableCell>{format(new Date(user.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant={user.isVerified ? 'outlined' : 'contained'}
                        onClick={() => handleVerifyUser(user.id, user.isVerified)}
                        sx={{
                          marginRight: 1,
                          backgroundColor: user.isVerified ? 'transparent' : '#27ae60',
                          color: user.isVerified ? '#27ae60' : 'white',
                          borderColor: '#27ae60',
                          fontSize: '0.75rem'
                        }}
                      >
                        {user.isVerified ? 'Unverify' : 'Verify'}
                      </Button>
                      <Button
                        size="small"
                        startIcon={<InfoIcon />}
                        onClick={() => handleViewDetails(user.id)}
                        sx={{ marginRight: 1, color: '#2976c3', fontSize: '0.75rem' }}
                      >
                        Details
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        color="error"
                        onClick={() => handleDeleteUser(user.id)}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 4 }}>
            <Button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              variant="outlined"
            >
              Previous
            </Button>
            <Typography sx={{ alignSelf: 'center', fontWeight: 'bold' }}>
              Page {page}
            </Typography>
            <Button
              disabled={users.length < limit}
              onClick={() => setPage(page + 1)}
              variant="outlined"
            >
              Next
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default AdminDashboard;

