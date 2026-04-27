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

/* ─── Color tokens – 70% White / 30% Green Palette ────────────────── */
const C = {
  // Primary green (30%)
  bright: '#2e7d32',        // Deep green for primary actions
  brightDark: '#1b5e20',    // Darker green for hover
  brightLight: '#4caf50',   // Lighter green for accents
  // Backgrounds (70% white/light tones)
  deep: '#f8fafc',          // Light grey-white background
  darker: '#f8fafc',        // Light grey-white background
  surface: '#ffffff',       // Pure white surfaces
  surfaceHigh: '#f1f5f9',   // Light grey for subtle contrast
  // Borders
  border: 'rgba(0,0,0,0.08)',
  borderHover: 'rgba(46,125,50,0.25)',
  // Text (Dark grey for high contrast on white)
  text: '#0f172a',          // Slate 900
  textMid: '#475569',       // Slate 600
  textLow: '#94a3b8',       // Slate 400
  // Status colors
  error: '#dc2626',
  errorBg: 'rgba(220,38,38,0.08)',
  success: '#2e7d32',
  successBg: 'rgba(46,125,50,0.08)',
  warning: '#d97706',
  warningBg: 'rgba(217,119,6,0.08)',
  // Glows
  glow: 'rgba(46,125,50,0.04)',
  glowStrong: 'rgba(46,125,50,0.12)',
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
    <Box sx={{
      minHeight: '100vh',
      background: C.darker,
      color: C.text,
      fontFamily: "'Outfit', sans-serif",
      overflowX: 'hidden',
      position: 'relative',
    }}>
      {/* Ambient orbs */}
      <Box sx={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <Box sx={{
          position: 'absolute', top: '-15%', right: '-10%',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46,125,50,0.04) 0%, transparent 65%)',
          animation: 'floatA 14s ease-in-out infinite',
        }} />
        <Box sx={{
          position: 'absolute', bottom: '10%', left: '-8%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46,125,50,0.03) 0%, transparent 65%)',
          animation: 'floatB 18s ease-in-out infinite',
        }} />
        <Box sx={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(46,125,50,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,125,50,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }} />
      </Box>

      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(3deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(-2deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 5, animation: 'fadeUp 0.7s ease both' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ width: 40, height: 1, background: C.bright }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.bright }}>
              Management
            </Typography>
            <Box sx={{ width: 40, height: 1, background: C.bright }} />
          </Box>
          <Typography sx={{
            fontSize: '3rem',
            fontWeight: 600,
            fontFamily: "'Cormorant Garamond', serif",
            color: C.text,
            mb: 1,
            letterSpacing: '-1px',
          }}>
            Users Management
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: C.textMid }}>
            View and manage all system users
          </Typography>
        </Box>

        {error && (
          <Box sx={{
            p: 2.5,
            background: C.errorBg,
            border: `1px solid ${C.error}33`,
            borderRadius: '12px',
            mb: 3,
            color: C.error,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="2" />
              <path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <Typography sx={{ fontSize: '0.9rem' }}>{error}</Typography>
          </Box>
        )}

        {/* Search and Filters */}
        <Box sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
          backgroundColor: C.surface,
          p: 2.5,
          borderRadius: '16px',
          border: `1px solid ${C.border}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
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
                backgroundColor: C.surfaceHigh,
                '& fieldset': { borderColor: C.border },
                '&:hover fieldset': { borderColor: C.borderHover },
                '&.Mui-focused fieldset': { borderColor: C.bright }
              },
              '& .MuiOutlinedInput-input::placeholder': {
                color: C.textLow,
                opacity: 1
              },
              '& .MuiInputLabel-root': { color: C.textLight }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: C.textMid, mr: 1, fontSize: '1.1rem' }} />
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
                backgroundColor: C.surfaceHigh,
                '& fieldset': { borderColor: C.border },
                '&:hover fieldset': { borderColor: C.borderHover }
              },
              '& .MuiInputLabel-root': { color: C.textLight }
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
                backgroundColor: C.surfaceHigh,
                '& fieldset': { borderColor: C.border },
                '&:hover fieldset': { borderColor: C.borderHover }
              },
              '& .MuiInputLabel-root': { color: C.textLight }
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
              background: C.glow,
              color: C.bright,
              border: `1px solid ${C.border}`,
              textTransform: 'none',
              px: 3,
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: C.surfaceHigh,
                borderColor: C.bright,
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
          <Box sx={{
            backgroundColor: C.surface,
            borderRadius: '16px',
            border: `1px solid ${C.border}`,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: C.surfaceHigh, borderBottom: `1px solid ${C.border}` }}>
                    {['Email', 'Type', 'Name', 'Verified', 'Created', 'Actions'].map((h) => (
                      <TableCell key={h} sx={{
                        color: C.bright,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow
                      key={user.id}
                      sx={{
                        borderBottom: `1px solid ${C.border}`,
                        transition: 'all 0.2s ease',
                        animation: `fadeUp 0.3s ease ${index * 0.03}s both`,
                        '&:hover': {
                          backgroundColor: C.glow,
                        }
                      }}
                    >
                      <TableCell sx={{ color: C.text, fontSize: '0.85rem' }}>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.type === 'seller' ? 'Seller' : 'Collector'}
                          size="small"
                          sx={{
                            background: user.type === 'seller' ? C.successBg : C.successBg,
                            color: C.bright,
                            fontWeight: 500,
                            fontSize: '0.7rem',
                            borderRadius: '100px',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: C.text, fontSize: '0.85rem' }}>{user.name || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          icon={user.isVerified ? <VerifiedUserIcon sx={{ fontSize: '0.8rem' }} /> : undefined}
                          label={user.isVerified ? 'Verified' : 'Unverified'}
                          size="small"
                          sx={{
                            background: user.isVerified ? C.successBg : C.warningBg,
                            color: user.isVerified ? C.success : C.warning,
                            fontWeight: 500,
                            fontSize: '0.7rem',
                            borderRadius: '100px',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: C.textMid, fontSize: '0.8rem' }}>
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            onClick={() => handleVerifyUser(user.id, user.isVerified)}
                            sx={{
                              color: C.bright,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              border: `1px solid ${C.border}`,
                              textTransform: 'none',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: '6px',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: C.bright,
                                backgroundColor: C.glow,
                              }
                            }}
                          >
                            {user.isVerified ? 'Unverify' : 'Verify'}
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleDeleteUser(user.id)}
                            startIcon={<DeleteIcon sx={{ fontSize: '0.9rem' }} />}
                            sx={{
                              color: C.error,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              border: `1px solid ${C.error}33`,
                              textTransform: 'none',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: '6px',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: C.error,
                                backgroundColor: C.errorBg,
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
          <Box sx={{
            textAlign: 'center',
            py: 6,
            backgroundColor: C.surface,
            borderRadius: '16px',
            border: `1px solid ${C.border}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
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
                borderRadius: '8px',
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
                borderRadius: '8px',
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