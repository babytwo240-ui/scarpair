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
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  InputAdornment,
  Button,
  Chip,
} from '@mui/material';
import { format } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

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

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    verified: '',
    search: ''
  });
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchUsers();
  }, [filters, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const queryParams = new URLSearchParams({
        type: filters.type || '',
        verified: filters.verified || '',
        search: filters.search || '',
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5498/api'}/admin/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5498/api'}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleVerifyUser = async (userId, currentStatus) => {
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

      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to update verification status');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: C.darker, color: C.text, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden' }}>
      {/* Grain overlay */}
      <Box sx={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.015'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Typography sx={{ fontSize: '3rem', fontWeight: 900, color: C.bright, mb: 1 }}>
            ◉ Users Management
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: C.textMid }}>
            View and manage all system users
          </Typography>
        </Box>

        {error && (
          <Box sx={{ p: 2.5, background: 'rgba(255,67,67,0.12)', border: `1px solid rgba(255,67,67,0.35)`, borderRadius: '12px', mb: 3, color: '#ff9b9b' }}>
            <Typography sx={{ fontSize: '0.9rem' }}>{error}</Typography>
          </Box>
        )}

        {/* Search and Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', backgroundColor: C.surface, p: 2.5, borderRadius: '12px', border: `1px solid ${C.border}` }}>
          <TextField
            placeholder="Search users..."
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            size="small"
            sx={{
              flex: 1,
              minWidth: '200px',
              '& .MuiOutlinedInput-root': {
                color: C.text,
                backgroundColor: `${C.darker}ee`,
                '& fieldset': { borderColor: C.border },
                '&:hover fieldset': { borderColor: C.borderHover },
                '&.Mui-focused fieldset': { borderColor: C.bright }
              },
              '& .MuiOutlinedInput-input::placeholder': {
                color: C.textLow,
                opacity: 1
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: C.textMid, mr: 1 }} />
                </InputAdornment>
              )
            }}
          />

          <TextField
            select
            label="User Type"
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            size="small"
            sx={{
              minWidth: '150px',
              '& .MuiOutlinedInput-root': {
                color: C.text,
                backgroundColor: `${C.darker}ee`,
                '& fieldset': { borderColor: C.border },
                '&:hover fieldset': { borderColor: C.borderHover }
              },
              '& .MuiInputBase-root': { color: C.text }
            }}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="seller">Seller</MenuItem>
            <MenuItem value="collector">Collector</MenuItem>
          </TextField>

          <TextField
            select
            label="Verification Status"
            name="verified"
            value={filters.verified}
            onChange={handleFilterChange}
            size="small"
            sx={{
              minWidth: '150px',
              '& .MuiOutlinedInput-root': {
                color: C.text,
                backgroundColor: `${C.darker}ee`,
                '& fieldset': { borderColor: C.border },
                '&:hover fieldset': { borderColor: C.borderHover }
              },
              '& .MuiInputBase-root': { color: C.text }
            }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="true">Verified</MenuItem>
            <MenuItem value="false">Unverified</MenuItem>
          </TextField>

          <Button
            onClick={() => {
              setFilters({ type: '', verified: '', search: '' });
              setPage(1);
            }}
            sx={{
              background: `linear-gradient(135deg, ${C.bright}22, ${C.bright}00)`,
              color: C.bright,
              border: `1px solid ${C.border}`,
              textTransform: 'none',
              px: 3,
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: `linear-gradient(135deg, ${C.bright}33, ${C.bright}11)`,
                borderColor: C.borderHover,
                boxShadow: `0 0 20px ${C.glow}`
              }
            }}
          >
            Reset Filters
          </Button>
        </Box>

        {/* Loading indicator */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress sx={{ color: C.bright }} />
          </Box>
        )}

        {/* Users Table */}
        {!loading && users.length > 0 && (
          <Box sx={{ backgroundColor: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: `rgba(100,255,67,0.08)`, borderBottom: `2px solid ${C.border}` }}>
                    <TableCell sx={{ color: C.bright, fontWeight: 600, fontSize: '0.9rem' }}>Email</TableCell>
                    <TableCell sx={{ color: C.bright, fontWeight: 600, fontSize: '0.9rem' }}>Type</TableCell>
                    <TableCell sx={{ color: C.bright, fontWeight: 600, fontSize: '0.9rem' }}>Name</TableCell>
                    <TableCell sx={{ color: C.bright, fontWeight: 600, fontSize: '0.9rem' }}>Verified</TableCell>
                    <TableCell sx={{ color: C.bright, fontWeight: 600, fontSize: '0.9rem' }}>Created</TableCell>
                    <TableCell sx={{ color: C.bright, fontWeight: 600, fontSize: '0.9rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow
                      key={user.id}
                      sx={{
                        borderBottom: `1px solid ${C.border}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: `${C.glow}`,
                          borderBottomColor: C.borderHover
                        }
                      }}
                    >
                      <TableCell sx={{ color: C.text, fontSize: '0.9rem' }}>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.type === 'seller' ? 'Seller' : 'Collector'}
                          size="small"
                          sx={{
                            background: user.type === 'seller' ? 'rgba(100,255,67,0.2)' : 'rgba(100,255,67,0.15)',
                            color: C.bright,
                            fontWeight: 500,
                            fontSize: '0.8rem'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: C.text, fontSize: '0.9rem' }}>{user.name || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          icon={user.isVerified ? <VerifiedUserIcon /> : undefined}
                          label={user.isVerified ? 'Verified' : 'Unverified'}
                          size="small"
                          sx={{
                            background: user.isVerified ? 'rgba(100,255,67,0.25)' : 'rgba(255,107,107,0.2)',
                            color: user.isVerified ? C.bright : '#ff9b9b',
                            fontWeight: 500,
                            fontSize: '0.8rem'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: C.textMid, fontSize: '0.85rem' }}>
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell sx={{ color: C.text }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            onClick={() => handleVerifyUser(user.id, user.isVerified)}
                            sx={{
                              color: C.bright,
                              fontSize: '0.75rem',
                              border: `1px solid ${C.border}`,
                              textTransform: 'none',
                              px: 1.5,
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: C.borderHover,
                                boxShadow: `0 0 10px ${C.glow}`
                              }
                            }}
                          >
                            {user.isVerified ? 'Unverify' : 'Verify'}
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleDeleteUser(user.id)}
                            startIcon={<DeleteIcon sx={{ fontSize: '1rem' }} />}
                            sx={{
                              color: '#ff9b9b',
                              fontSize: '0.75rem',
                              border: '1px solid rgba(255,107,107,0.3)',
                              textTransform: 'none',
                              px: 1.5,
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: 'rgba(255,107,107,0.6)',
                                boxShadow: '0 0 10px rgba(255,107,107,0.2)'
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Empty state */}
        {!loading && users.length === 0 && !error && (
          <Box sx={{ textAlign: 'center', py: 6, backgroundColor: C.surface, borderRadius: '12px', border: `1px solid ${C.border}` }}>
            <Typography sx={{ color: C.textMid, fontSize: '1rem' }}>No users found. Try adjusting your filters.</Typography>
          </Box>
        )}

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
            <Button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              sx={{
                color: C.bright,
                borderColor: C.bright,
                textTransform: 'none',
                '&:disabled': { color: C.textLow, borderColor: C.border }
              }}
              variant="outlined"
            >
              Previous
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, color: C.textMid }}>
              Page {page}
            </Box>
            <Button
              disabled={users.length < limit}
              onClick={() => setPage(p => p + 1)}
              sx={{
                color: C.bright,
                borderColor: C.bright,
                textTransform: 'none',
                '&:disabled': { color: C.textLow, borderColor: C.border }
              }}
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

export default AdminUsersPage;
