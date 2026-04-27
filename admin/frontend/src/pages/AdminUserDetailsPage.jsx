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
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: C.bright }} />
          <Typography sx={{ color: C.textMid, mt: 2, fontSize: '0.9rem' }}>Loading user details...</Typography>
        </Box>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', background: C.darker, color: C.text, fontFamily: "'Outfit', sans-serif", overflowX: 'hidden', position: 'relative' }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/users')}
            sx={{ color: C.bright, textTransform: 'none', mb: 3 }}
          >
            Back to Users
          </Button>
          <Typography sx={{ color: C.error, fontSize: '1.2rem' }}>User not found</Typography>
        </Container>
      </Box>
    );
  }

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
              color: C.brightDark,
              transform: 'translateX(-4px)'
            }
          }}
        >
          Back to Users
        </Button>

        <Box sx={{ mb: 5, animation: 'fadeUp 0.7s ease both' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ width: 40, height: 1, background: C.bright }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.bright }}>
              User Profile
            </Typography>
            <Box sx={{ width: 40, height: 1, background: C.bright }} />
          </Box>
          <Typography sx={{
            fontSize: '2.5rem',
            fontWeight: 600,
            fontFamily: "'Cormorant Garamond', serif",
            color: C.text,
            mb: 1,
            letterSpacing: '-1px',
          }}>
            User Details
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: C.textMid }}>
            Viewing user #{id}
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

        <Card sx={{
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: '16px',
          mb: 4,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3, pb: 3, borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography sx={{ color: C.text, fontSize: '1.3rem', fontWeight: 700, mb: 1 }}>
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
                  background: user.isVerified ? C.successBg : C.warningBg,
                  color: user.isVerified ? C.success : C.warning,
                  fontWeight: 600,
                  borderRadius: '100px',
                }}
              />
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: C.textLow, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
                  User Type
                </Typography>
                <Typography sx={{ color: C.text, fontSize: '1rem', fontWeight: 500 }}>
                  {user.type === 'seller' ? 'Seller' : user.type === 'collector' ? 'Collector' : user.type}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: C.textLow, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
                  Phone
                </Typography>
                <Typography sx={{ color: C.text, fontSize: '1rem', fontWeight: 500 }}>
                  {user.phone || '—'}
                </Typography>
              </Grid>

              {user.businessName && (
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ color: C.textLow, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
                    Business Name
                  </Typography>
                  <Typography sx={{ color: C.text, fontSize: '1rem', fontWeight: 500 }}>
                    {user.businessName}
                  </Typography>
                </Grid>
              )}

              {user.companyName && (
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ color: C.textLow, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
                    Company Name
                  </Typography>
                  <Typography sx={{ color: C.text, fontSize: '1rem', fontWeight: 500 }}>
                    {user.companyName}
                  </Typography>
                </Grid>
              )}

              {user.specialization && (
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ color: C.textLow, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
                    Specialization
                  </Typography>
                  <Typography sx={{ color: C.text, fontSize: '1rem', fontWeight: 500 }}>
                    {user.specialization}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: C.textLow, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
                  Account Status
                </Typography>
                <Typography sx={{ color: user.isActive ? C.success : C.error, fontSize: '1rem', fontWeight: 600 }}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ borderColor: C.border, my: 2 }} />

            <Grid container spacing={2} sx={{ fontSize: '0.85rem' }}>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: C.textLow, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Created:</Typography>
                <Typography sx={{ color: C.textMid, fontSize: '0.85rem' }}>
                  {format(new Date(user.createdAt), 'MMM dd, yyyy HH:mm')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: C.textLow, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Last Updated:</Typography>
                <Typography sx={{ color: C.textMid, fontSize: '0.85rem' }}>
                  {format(new Date(user.updatedAt), 'MMM dd, yyyy HH:mm')}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            onClick={handleVerifyUser}
            startIcon={<VerifiedUserIcon />}
            sx={{
              background: C.glow,
              color: C.bright,
              border: `1px solid ${C.border}`,
              textTransform: 'none',
              px: 3,
              py: 1,
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: C.surfaceHigh,
                borderColor: C.bright,
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
              background: C.errorBg,
              color: C.error,
              border: `1px solid ${C.error}33`,
              textTransform: 'none',
              px: 3,
              py: 1,
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: C.errorBg,
                borderColor: C.error,
                boxShadow: `0 0 15px ${C.error}33`
              }
            }}
          >
            Delete User
          </Button>
        </Box>
      </Container>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: '16px',
            color: C.text,
            boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)',
          }
        }}
      >
        <DialogTitle sx={{
          color: C.error,
          fontWeight: 700,
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.5rem',
        }}>
          Delete User?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: C.textMid, mt: 2 }}>
            Are you sure you want to delete this user and all their associated data? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              color: C.textMid,
              border: `1px solid ${C.border}`,
              borderRadius: '8px',
              px: 2,
              '&:hover': { borderColor: C.bright, color: C.bright }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
            sx={{
              color: C.error,
              border: `1px solid ${C.error}33`,
              borderRadius: '8px',
              px: 2,
              '&:hover': {
                borderColor: C.error,
                background: C.errorBg
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUserDetailsPage;