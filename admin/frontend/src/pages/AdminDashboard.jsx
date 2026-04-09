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
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  Chip,
  LinearProgress
} from '@mui/material';
import { format } from 'date-fns';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';

const C = {
  bright: '#64ff43',
  deep: '#124d05',
  darker: '#0a2e03',
  surface: '#0d3806',
  border: 'rgba(100,255,67,0.18)',
  borderHover: 'rgba(100,255,67,0.45)',
  text: '#e6ffe0',
  textMid: 'rgba(230,255,224,0.55)',
  textLow: 'rgba(230,255,224,0.3)',
  glow: 'rgba(100,255,67,0.22)',
  glowStrong: 'rgba(100,255,67,0.45)',
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
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

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    
    const matchesType = filterType === 'all' || user.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive) ||
      (filterStatus === 'verified' && user.isVerified) ||
      (filterStatus === 'unverified' && !user.isVerified);
    
    return matchesSearch && matchesType && matchesStatus;
  });

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

  const getStatValue = (key) => stats?.[key] || 0;
  const verificationRate = users.length > 0 ? Math.round((users.filter(u => u.isVerified).length / users.length) * 100) : 0;

  return (
    <Box sx={{ minHeight: '100vh', background: C.darker, color: C.text, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden' }}>
      {/* Ambient cursor glow */}
      <Box sx={{ position: 'fixed', width: 600, height: 600, background: 'radial-gradient(circle, rgba(100,255,67,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, transition: 'all 0.3s ease' }} />

      {/* Grain overlay */}
      <Box sx={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.015'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography sx={{ fontSize: '3.2rem', fontWeight: 900, color: C.bright, letterSpacing: '-1.5px', mb: 1 }}>
            ◈ Admin Dashboard
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: C.textMid, fontWeight: 400 }}>
            System monitoring & user management
          </Typography>
        </Box>

        {error && (
          <Box sx={{ p: 2.5, background: 'rgba(255,67,67,0.12)', border: `1px solid rgba(255,67,67,0.35)`, borderRadius: '12px', mb: 3, color: '#ff9b9b', fontSize: '0.95rem' }}>
            {error}
          </Box>
        )}

        {/* KPI Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 5 }}>
            {[
              { label: 'Total Users', value: getStatValue('totalUsers'), icon: '◈' },
              { label: 'Active Users', value: users.filter(u => u.isActive).length, icon: '◎' },
              { label: 'Verified', value: users.filter(u => u.isVerified).length, icon: '◉' },
              { label: 'Materials', value: getStatValue('totalMaterials'), icon: '◐' },
            ].map((stat, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Box sx={{
                  p: 3,
                  background: `linear-gradient(135deg, ${C.surface} 0%, rgba(18,77,5,0.5) 100%)`,
                  border: `1px solid ${C.border}`,
                  borderRadius: '14px',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: C.borderHover,
                    boxShadow: `0 0 24px ${C.glow}`,
                    transform: 'translateY(-4px)'
                  }
                }}>
                  <Typography sx={{ fontSize: '2.2rem', mb: 0.5 }}>{stat.icon}</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: C.textLow, mb: 1 }}>{stat.label}</Typography>
                  <Typography sx={{ fontSize: '2.4rem', fontWeight: 800, color: C.bright }}>{stat.value}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Search & Filters */}
        <Box sx={{
          p: 3,
          background: `linear-gradient(135deg, ${C.surface} 0%, rgba(18,77,5,0.5) 100%)`,
          border: `1px solid ${C.border}`,
          borderRadius: '14px',
          mb: 4,
          backdropFilter: 'blur(8px)'
        }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: C.bright }} /></InputAdornment>,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: C.text,
                    '& fieldset': { borderColor: C.border },
                    '&:hover fieldset': { borderColor: C.borderHover },
                    '&.Mui-focused fieldset': { borderColor: C.bright, boxShadow: `0 0 16px ${C.glow}` },
                    background: 'rgba(13,56,6,0.6)',
                  },
                  '& .MuiOutlinedInput-input::placeholder': { color: C.textLow, opacity: 1 },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: C.text,
                    '& fieldset': { borderColor: C.border },
                    '&:hover fieldset': { borderColor: C.borderHover },
                    background: 'rgba(13,56,6,0.6)',
                  },
                  '& .MuiInputLabel-root': { color: C.textMid },
                }}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="recycler">Recycler</MenuItem>
                <MenuItem value="artist">Artist</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: C.text,
                    '& fieldset': { borderColor: C.border },
                    '&:hover fieldset': { borderColor: C.borderHover },
                    background: 'rgba(13,56,6,0.6)',
                  },
                  '& .MuiInputLabel-root': { color: C.textMid },
                }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="unverified">Unverified</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>

        {/* Users Table */}
        <Box sx={{
          borderRadius: '14px',
          overflow: 'hidden',
          border: `1px solid ${C.border}`,
          background: `linear-gradient(135deg, ${C.surface} 0%, rgba(18,77,5,0.4) 100%)`,
          backdropFilter: 'blur(8px)',
        }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress sx={{ color: C.bright }} />
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: C.textMid }}>
              No users found
            </Box>
          ) : (
            <TableContainer sx={{ background: 'transparent' }}>
              <Table sx={{ '& .MuiTableCell-root': { borderColor: C.border } }}>
                <TableHead>
                  <TableRow sx={{ background: 'rgba(12,34,2,0.8)' }}>
                    {['Name', 'Email', 'Type', 'Status', 'Verified', 'Joined', 'Actions'].map(h => (
                      <TableCell key={h} sx={{ color: C.bright, fontWeight: 700, fontSize: '0.9rem', py: 2 }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} sx={{ '&:hover': { background: `rgba(100,255,67,0.05)` }, transition: 'all 0.2s ease' }}>
                      <TableCell sx={{ color: C.text, fontWeight: 600 }}>{user.name || 'N/A'}</TableCell>
                      <TableCell sx={{ color: C.textMid, fontSize: '0.9rem' }}>{user.email}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, background: `${C.bright}22`, border: `1px solid ${C.bright}66`, borderRadius: '6px', color: C.bright, fontSize: '0.85rem', fontWeight: 600 }}>
                          {user.type}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, background: user.isActive ? 'rgba(100,255,67,0.15)' : 'rgba(255,107,107,0.15)', border: `1px solid ${user.isActive ? C.bright : '#ff6b6b'}44`, borderRadius: '6px', color: user.isActive ? C.bright : '#ff9b9b', fontSize: '0.85rem', fontWeight: 600 }}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, background: user.isVerified ? 'rgba(100,255,67,0.15)' : 'rgba(255,200,100,0.15)', border: `1px solid ${user.isVerified ? C.bright : '#ffc864'}44`, borderRadius: '6px', color: user.isVerified ? C.bright : '#ffc864', fontSize: '0.85rem', fontWeight: 600 }}>
                          {user.isVerified ? '✓ Verified' : 'Pending'}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: C.textMid, fontSize: '0.9rem' }}>{format(new Date(user.createdAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" onClick={() => handleViewDetails(user.id)} sx={{ color: C.bright, fontSize: '0.75rem', textTransform: 'none', '&:hover': { background: `${C.bright}22` } }}>
                            Details
                          </Button>
                          <Button size="small" onClick={() => handleVerifyUser(user.id, user.isVerified)} sx={{ color: C.bright, fontSize: '0.75rem', textTransform: 'none', '&:hover': { background: `${C.bright}22` } }}>
                            {user.isVerified ? 'Unverify' : 'Verify'}
                          </Button>
                          <Button size="small" onClick={() => handleDeleteUser(user.id)} sx={{ color: '#ff9b9b', fontSize: '0.75rem', textTransform: 'none', '&:hover': { background: 'rgba(255,107,107,0.15)' } }}>
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 6, pt: 4, borderTop: `1px solid ${C.border}`, color: C.textLow, fontSize: '0.9rem' }}>
          Showing {filteredUsers.length} of {users.length} users • Last updated: {new Date().toLocaleTimeString()}
        </Box>
      </Container>
    </Box>
  );
}

function LineProgress({ value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
      <LinearProgress 
        variant="determinate" 
        value={value} 
        sx={{ 
          flex: 1,
          backgroundColor: 'rgba(255,255,255,0.3)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: 'rgba(255,255,255,0.9)'
          }
        }} 
      />
      <Typography variant="caption" sx={{ minWidth: 40 }}>
        {value}%
      </Typography>
    </Box>
  );
}

export default AdminDashboard;


