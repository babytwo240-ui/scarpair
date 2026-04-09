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
    if (rating >= 4.5) return { label: 'Excellent', bgColor: 'rgba(100,255,67,0.15)', textColor: C.bright };
    if (rating >= 4) return { label: 'Very Good', bgColor: 'rgba(78,205,196,0.15)', textColor: '#4ecdc4' };
    if (rating >= 3) return { label: 'Good', bgColor: 'rgba(255,200,100,0.15)', textColor: '#ffc864' };
    if (rating >= 2) return { label: 'Fair', bgColor: 'rgba(255,140,100,0.15)', textColor: '#ff8c64' };
    return { label: 'Poor', bgColor: 'rgba(255,100,100,0.15)', textColor: '#ff6464' };
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
        <CircularProgress sx={{ color: C.bright }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: C.darker, color: C.text, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden' }}>
      {/* Grain overlay */}
      <Box sx={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.015'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Typography sx={{ fontSize: '3rem', fontWeight: 900, color: C.bright, mb: 1 }}>
            ◈ Ratings Management
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: C.textMid }}>
            Monitor user and post ratings across the platform
          </Typography>
        </Box>

        {error && (
          <Box sx={{ p: 2.5, background: 'rgba(255,67,67,0.12)', border: `1px solid rgba(255,67,67,0.35)`, borderRadius: '12px', mb: 3, color: '#ff9b9b' }}>
            {error}
          </Box>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={2.5} sx={{ mb: 5 }}>
          {[
            { label: 'Rated Users', value: stats.totalUserRatings, icon: '◎' },
            { label: 'Avg User Rating', value: stats.avgUserRating, icon: '◈' },
            { label: 'Rated Posts', value: stats.totalPostRatings, icon: '◐' },
            { label: 'Avg Post Rating', value: stats.avgPostRating, icon: '◉' }
          ].map((stat, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{
                background: `linear-gradient(135deg, ${C.surface} 0%, rgba(18,77,5,0.5) 100%)`,
                border: `1px solid ${C.border}`,
                borderRadius: '12px',
                backdropFilter: 'blur(8px)',
                color: C.text,
                '&:hover': {
                  borderColor: C.borderHover,
                  boxShadow: `0 0 20px ${C.glow}`
                },
                transition: 'all 0.3s ease'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.85rem', color: C.textMid, mb: 1 }}>
                        {stat.label}
                      </Typography>
                      <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: C.bright }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '2rem', color: `${C.bright}44`, fontWeight: 900 }}>
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
            '&.Mui-selected': {
              color: C.bright
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: C.bright
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
            borderRadius: '14px',
            overflow: 'hidden',
            border: `1px solid ${C.border}`,
            background: `linear-gradient(135deg, ${C.surface} 0%, rgba(18,77,5,0.4) 100%)`,
            backdropFilter: 'blur(8px)',
          }}>
            {userRatings.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center', color: C.textMid }}>
                No user ratings found
              </Box>
            ) : (
              <TableContainer sx={{ background: 'transparent' }}>
                <Table sx={{ '& .MuiTableCell-root': { borderColor: C.border } }}>
                  <TableHead>
                    <TableRow sx={{ background: 'rgba(12,34,2,0.8)' }}>
                      <TableCell sx={{ color: C.bright, fontWeight: 700 }}>User ID</TableCell>
                      <TableCell align="center" sx={{ color: C.bright, fontWeight: 700 }}>Avg Rating</TableCell>
                      <TableCell align="center" sx={{ color: C.bright, fontWeight: 700 }}>Total Ratings</TableCell>
                      <TableCell align="center" sx={{ color: C.bright, fontWeight: 700 }}>Feedback Count</TableCell>
                      <TableCell align="center" sx={{ color: C.bright, fontWeight: 700 }}>Category</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userRatings.map((rating) => {
                      const category = getRatingCategory(rating.averageRating || 0);
                      return (
                        <TableRow key={rating.userId} sx={{ '&:hover': { background: `rgba(100,255,67,0.05)` } }}>
                          <TableCell sx={{ color: C.text }}>#{rating.userId}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <Rating value={(rating.averageRating || 0) / 5 * 5} readOnly size="small" precision={0.5} sx={{ '& .MuiRating-icon': { color: C.bright } }} />
                              <Typography sx={{ color: C.text }}>{(rating.averageRating || 0).toFixed(2)}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ color: C.textMid }}>{rating.totalRatings || 0}</TableCell>
                          <TableCell align="center" sx={{ color: C.textMid }}>{rating.totalFeedback || 0}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={category.label}
                              sx={{ backgroundColor: category.bgColor, color: category.textColor, fontWeight: 600 }}
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
            borderRadius: '14px',
            overflow: 'hidden',
            border: `1px solid ${C.border}`,
            background: `linear-gradient(135deg, ${C.surface} 0%, rgba(18,77,5,0.4) 100%)`,
            backdropFilter: 'blur(8px)',
          }}>
            {postRatings.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center', color: C.textMid }}>
                No post ratings found
              </Box>
            ) : (
              <TableContainer sx={{ background: 'transparent' }}>
                <Table sx={{ '& .MuiTableCell-root': { borderColor: C.border } }}>
                  <TableHead>
                    <TableRow sx={{ background: 'rgba(12,34,2,0.8)' }}>
                      <TableCell sx={{ color: C.bright, fontWeight: 700 }}>Post ID</TableCell>
                      <TableCell align="center" sx={{ color: C.bright, fontWeight: 700 }}>Avg Rating</TableCell>
                      <TableCell align="center" sx={{ color: C.bright, fontWeight: 700 }}>Total Ratings</TableCell>
                      <TableCell align="center" sx={{ color: C.bright, fontWeight: 700 }}>Feedback Count</TableCell>
                      <TableCell align="center" sx={{ color: C.bright, fontWeight: 700 }}>Category</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {postRatings.map((rating) => {
                      const category = getRatingCategory(rating.averageRating || 0);
                      return (
                        <TableRow key={rating.postId} sx={{ '&:hover': { background: `rgba(100,255,67,0.05)` } }}>
                          <TableCell sx={{ color: C.text }}>#{rating.postId}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <Rating value={(rating.averageRating || 0) / 5 * 5} readOnly size="small" precision={0.5} sx={{ '& .MuiRating-icon': { color: C.bright } }} />
                              <Typography sx={{ color: C.text }}>{(rating.averageRating || 0).toFixed(2)}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ color: C.textMid }}>{rating.totalRatings || 0}</TableCell>
                          <TableCell align="center" sx={{ color: C.textMid }}>{rating.totalFeedback || 0}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={category.label}
                              sx={{ backgroundColor: category.bgColor, color: category.textColor, fontWeight: 600 }}
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

