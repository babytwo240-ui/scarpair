import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Rating,
  Chip
} from '@mui/material';
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
  // Rating category colors
  excellent: '#2e7d32',
  excellentBg: 'rgba(46,125,50,0.08)',
  veryGood: '#4caf50',
  veryGoodBg: 'rgba(76,175,80,0.08)',
  good: '#d97706',
  goodBg: 'rgba(217,119,6,0.08)',
  fair: '#ea580c',
  fairBg: 'rgba(234,88,12,0.08)',
  poor: '#dc2626',
  poorBg: 'rgba(220,38,38,0.08)',
  // Glows
  glow: 'rgba(46,125,50,0.04)',
  glowStrong: 'rgba(46,125,50,0.12)',
};

const AdminRatingsPage = () => {
  const navigate = useNavigate();
  const [userRatings, setUserRatings] = useState([]);
  const [postRatings, setPostRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5498/api';
      const [userRes, postRes] = await Promise.all([
        fetch(`${apiUrl}/admin/ratings/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/admin/ratings/posts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const userData = await userRes.json();
      const postData = await postRes.json();

      if (userData.data) {
        setUserRatings(Array.isArray(userData.data) ? userData.data : []);
      }
      if (postData.data) {
        setPostRatings(Array.isArray(postData.data) ? postData.data : []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch ratings');
    } finally {
      setLoading(false);
    }
  };

  const getRatingCategory = (rating) => {
    if (rating >= 4.5) return { label: 'Excellent', bgColor: C.excellentBg, textColor: C.excellent };
    if (rating >= 4) return { label: 'Very Good', bgColor: C.veryGoodBg, textColor: C.veryGood };
    if (rating >= 3) return { label: 'Good', bgColor: C.goodBg, textColor: C.good };
    if (rating >= 2) return { label: 'Fair', bgColor: C.fairBg, textColor: C.fair };
    return { label: 'Poor', bgColor: C.poorBg, textColor: C.poor };
  };

  const stats = {
    totalUserRatings: userRatings.length,
    totalPostRatings: postRatings.length,
    avgUserRating: userRatings.length > 0
      ? (userRatings.reduce((sum, r) => sum + (r.averageRating || 0), 0) / userRatings.length).toFixed(2)
      : 0,
    avgPostRating: postRatings.length > 0
      ? (postRatings.reduce((sum, r) => sum + (r.averageRating || 0), 0) / postRatings.length).toFixed(2)
      : 0
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', background: C.darker, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: C.bright }} />
          <Typography sx={{ color: C.textMid, mt: 2, fontSize: '0.9rem' }}>Loading ratings...</Typography>
        </Box>
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
            Ratings Management
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: C.textMid }}>
            Monitor user and post ratings across the platform
          </Typography>
        </Box>

        {error && (
          <Box sx={{
            p: 2.5,
            background: C.poorBg,
            border: `1px solid ${C.poor}33`,
            borderRadius: '12px',
            mb: 3,
            color: C.poor,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke={C.poor} strokeWidth="2" />
              <path d="M10 6v4M10 14h.01" stroke={C.poor} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <Typography sx={{ fontSize: '0.9rem' }}>{error}</Typography>
          </Box>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={2.5} sx={{ mb: 5 }}>
          {[
            { label: 'Rated Users', value: stats.totalUserRatings, icon: '◎', color: C.bright },
            { label: 'Avg User Rating', value: stats.avgUserRating, icon: '◈', color: C.brightLight },
            { label: 'Rated Posts', value: stats.totalPostRatings, icon: '◐', color: C.bright },
            { label: 'Avg Post Rating', value: stats.avgPostRating, icon: '◉', color: C.brightLight }
          ].map((stat, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: '16px',
                color: C.text,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                animation: `fadeUp 0.5s ease ${i * 0.1}s both`,
                '&:hover': {
                  borderColor: C.borderHover,
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 24px -12px rgba(0,0,0,0.12)`
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.textMid, mb: 1, letterSpacing: '0.05em' }}>
                        {stat.label}
                      </Typography>
                      <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '2rem', color: `${C.bright}22`, fontWeight: 600 }}>
                      {stat.icon}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Box sx={{
          borderBottom: `1px solid ${C.border}`,
          mb: 3,
          '& .MuiTab-root': {
            color: C.textMid,
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.9rem',
            '&.Mui-selected': {
              color: C.bright
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: C.bright,
            height: 3,
            borderRadius: '3px'
          }
        }}>
          <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
            <Tab label={`User Ratings (${stats.totalUserRatings})`} />
            <Tab label={`Post Ratings (${stats.totalPostRatings})`} />
          </Tabs>
        </Box>

        {/* User Ratings Table */}
        {activeTab === 0 && (
          <Box sx={{
            borderRadius: '16px',
            overflow: 'hidden',
            border: `1px solid ${C.border}`,
            background: C.surface,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            {userRatings.length === 0 ? (
              <Box sx={{ p: 6, textAlign: 'center', color: C.textMid }}>
                <Box sx={{ fontSize: 48, mb: 2 }}>⭐</Box>
                <Typography>No user ratings found</Typography>
              </Box>
            ) : (
              <TableContainer sx={{ background: 'transparent' }}>
                <Table sx={{ '& .MuiTableCell-root': { borderColor: C.border } }}>
                  <TableHead>
                    <TableRow sx={{ background: C.surfaceHigh }}>
                      <TableCell sx={{ color: C.bright, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>User ID</TableCell>
                      <TableCell align="center" sx={{ color: C.bright, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Avg Rating</TableCell>
                      <TableCell align="center" sx={{ color: C.bright, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total Ratings</TableCell>
                      <TableCell align="center" sx={{ color: C.bright, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Feedback Count</TableCell>
                      <TableCell align="center" sx={{ color: C.bright, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Category</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userRatings.map((rating, index) => {
                      const category = getRatingCategory(rating.averageRating || 0);
                      return (
                        <TableRow
                          key={rating.userId}
                          sx={{
                            '&:hover': { background: C.glow },
                            animation: `fadeUp 0.3s ease ${index * 0.03}s both`,
                          }}
                        >
                          <TableCell sx={{ color: C.text, fontWeight: 500 }}>#{rating.userId}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <Rating
                                value={(rating.averageRating || 0)}
                                readOnly
                                size="small"
                                precision={0.5}
                                sx={{
                                  '& .MuiRating-iconFilled': { color: C.bright },
                                  '& .MuiRating-iconHover': { color: C.brightLight }
                                }}
                              />
                              <Typography sx={{ color: C.text, fontWeight: 600 }}>
                                {(rating.averageRating || 0).toFixed(2)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ color: C.textMid }}>{rating.totalRatings || 0}</TableCell>
                          <TableCell align="center" sx={{ color: C.textMid }}>{rating.totalFeedback || 0}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={category.label}
                              sx={{
                                backgroundColor: category.bgColor,
                                color: category.textColor,
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                borderRadius: '100px',
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Post Ratings Table */}
        {activeTab === 1 && (
          <Box sx={{
            borderRadius: '16px',
            overflow: 'hidden',
            border: `1px solid ${C.border}`,
            background: C.surface,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            {postRatings.length === 0 ? (
              <Box sx={{ p: 6, textAlign: 'center', color: C.textMid }}>
                <Box sx={{ fontSize: 48, mb: 2 }}>📝</Box>
                <Typography>No post ratings found</Typography>
              </Box>
            ) : (
              <TableContainer sx={{ background: 'transparent' }}>
                <Table sx={{ '& .MuiTableCell-root': { borderColor: C.border } }}>
                  <TableHead>
                    <TableRow sx={{ background: C.surfaceHigh }}>
                      <TableCell sx={{ color: C.bright, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Post ID</TableCell>
                      <TableCell align="center" sx={{ color: C.bright, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Avg Rating</TableCell>
                      <TableCell align="center" sx={{ color: C.bright, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total Ratings</TableCell>
                      <TableCell align="center" sx={{ color: C.bright, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Feedback Count</TableCell>
                      <TableCell align="center" sx={{ color: C.bright, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Category</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {postRatings.map((rating, index) => {
                      const category = getRatingCategory(rating.averageRating || 0);
                      return (
                        <TableRow
                          key={rating.postId}
                          sx={{
                            '&:hover': { background: C.glow },
                            animation: `fadeUp 0.3s ease ${index * 0.03}s both`,
                          }}
                        >
                          <TableCell sx={{ color: C.text, fontWeight: 500 }}>#{rating.postId}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <Rating
                                value={(rating.averageRating || 0)}
                                readOnly
                                size="small"
                                precision={0.5}
                                sx={{
                                  '& .MuiRating-iconFilled': { color: C.bright },
                                  '& .MuiRating-iconHover': { color: C.brightLight }
                                }}
                              />
                              <Typography sx={{ color: C.text, fontWeight: 600 }}>
                                {(rating.averageRating || 0).toFixed(2)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ color: C.textMid }}>{rating.totalRatings || 0}</TableCell>
                          <TableCell align="center" sx={{ color: C.textMid }}>{rating.totalFeedback || 0}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={category.label}
                              sx={{
                                backgroundColor: category.bgColor,
                                color: category.textColor,
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                borderRadius: '100px',
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default AdminRatingsPage;