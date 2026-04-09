import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { format } from 'date-fns';

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

const AdminUserDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5498/api'}/admin/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      setError(err.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5498/api'}/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setDeleteDialogOpen(false);
      navigate('/admin/users');
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleVerifyUser = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5498/api'}/admin/users/${id}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isVerified: !user.isVerified })
      });

      if (!response.ok) {
        throw new Error('Failed to update verification status');
      }

      fetchUserDetails();
    } catch (err) {
      setError(err.message || 'Failed to update verification status');
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', background: C.darker, display: 'flex', justifyContent: 'center', alignItems: 'center', color: C.text }}>
        <CircularProgress sx={{ color: C.bright }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', background: C.darker, color: C.text, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden' }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/users')}
            sx={{ color: C.bright, textTransform: 'none', mb: 3 }}
          >
            Back to Users
          </Button>
          <Typography sx={{ color: '#ff9b9b', fontSize: '1.2rem' }}>User not found</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: C.darker, color: C.text, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden' }}>
      <Box sx={{ position: 'fixed', inset: 0, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 200 200%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%270.015%27/%3E%3C/svg%3E")', pointerEvents: 'none', zIndex: 1 }} />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 10, py: 6 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/users')}
          sx={{
            color: C.bright,
            textTransform: 'none',
            mb: 4,
            transition: 'all 0.2s',
            '&:hover': {
              color: C.text,
              transform: 'translateX(-4px)'
            }
          }}
        >
          Back to Users
        </Button>

        <Box sx={{ mb: 5 }}>
          <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: C.bright, mb: 1 }}>
            User Details
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: C.textMid }}>
            Viewing user {id}
          </Typography>
        </Box>

        {error && (
          <Box sx={{ p: 2.5, background: 'rgba(255,67,67,0.12)', border: '1px solid rgba(255,67,67,0.35)', borderRadius: '12px', mb: 3, color: '#ff9b9b' }}>
            <Typography sx={{ fontSize: '0.9rem' }}>{error}</Typography>
          </Box>
        )}

        <Card sx={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3, pb: 3, borderBottom: `1px solid ${C.border}` }}>
              <Box>
                <Typography sx={{ color: C.text, fontSize: '1.3rem', fontWeight: 600, mb: 1 }}>
                  {user.name || user.businessName || user.companyName || 'N/A'}
                </Typography>
                <Typography sx={{ color: C.textMid, fontSize: '0.9rem' }}>
                  {user.email}
                </Typography>
              </Box>
              <Chip
                icon={user.isVerified ? <VerifiedUserIcon /> : undefined}
                label={user.isVerified ? 'Verified' : 'Unverified'}
                sx={{
                  background: user.isVerified ? 'rgba(100,255,67,0.25)' : 'rgba(255,107,107,0.2)',
                  color: user.isVerified ? C.bright : '#ff9b9b',
                  fontWeight: 500
                }}
              />
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: C.textLow, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>
                  User Type
                </Typography>
                <Typography sx={{ color: C.text, fontSize: '1rem' }}>
                  {user.type === 'seller' ? 'Seller' : user.type === 'collector' ? 'Collector' : user.type}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: C.textLow, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>
                  Phone
                </Typography>
                <Typography sx={{ color: C.text, fontSize: '1rem' }}>
                  {user.phone || '—'}
                </Typography>
              </Grid>

              {user.businessName && (
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ color: C.textLow, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>
                    Business Name
                  </Typography>
                  <Typography sx={{ color: C.text, fontSize: '1rem' }}>
                    {user.businessName}
                  </Typography>
                </Grid>
              )}

              {user.companyName && (
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ color: C.textLow, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>
                    Company Name
                  </Typography>
                  <Typography sx={{ color: C.text, fontSize: '1rem' }}>
                    {user.companyName}
                  </Typography>
                </Grid>
              )}

              {user.specialization && (
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ color: C.textLow, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>
                    Specialization
                  </Typography>
                  <Typography sx={{ color: C.text, fontSize: '1rem' }}>
                    {user.specialization}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: C.textLow, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>
                  Account Status
                </Typography>
                <Typography sx={{ color: user.isActive ? C.bright : '#ff9b9b', fontSize: '1rem', fontWeight: 500 }}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ borderColor: C.border, my: 2 }} />

            <Grid container spacing={2} sx={{ fontSize: '0.85rem' }}>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: C.textLow }}>Created:</Typography>
                <Typography sx={{ color: C.textMid }}>
                  {format(new Date(user.createdAt), 'MMM dd, yyyy HH:mm')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: C.textLow }}>Last Updated:</Typography>
                <Typography sx={{ color: C.textMid }}>
                  {format(new Date(user.updatedAt), 'MMM dd, yyyy HH:mm')}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={handleVerifyUser}
            startIcon={<VerifiedUserIcon />}
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
            {user.isVerified ? 'Unverify User' : 'Verify User'}
          </Button>

          <Button
            onClick={() => setDeleteDialogOpen(true)}
            startIcon={<DeleteIcon />}
            sx={{
              background: 'rgba(255,107,107,0.1)',
              color: '#ff9b9b',
              border: '1px solid rgba(255,107,107,0.3)',
              textTransform: 'none',
              px: 3,
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(255,107,107,0.15)',
                borderColor: 'rgba(255,107,107,0.6)',
                boxShadow: '0 0 15px rgba(255,107,107,0.2)'
              }
            }}
          >
            Delete User
          </Button>
        </Box>
      </Container>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} sx={{ '& .MuiDialog-paper': { backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', color: C.text } }}>
        <DialogTitle sx={{ color: C.bright, fontWeight: 600 }}>Delete User?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: C.text, mt: 2 }}>Are you sure you want to delete this user and all their associated data? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: C.textMid }}>Cancel</Button>
          <Button onClick={handleDeleteUser} sx={{ color: '#ff9b9b', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '6px', px: 2, '&:hover': { borderColor: 'rgba(255,107,107,0.6)', background: 'rgba(255,107,107,0.1)' } }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUserDetailsPage;

