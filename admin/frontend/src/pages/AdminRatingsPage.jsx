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
  Rating
} from '@mui/material';
import { format } from 'date-fns';

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRatingCategory = (rating) => {
    if (rating >= 4.5) return { label: 'Excellent', color: '#27ae60' };
    if (rating >= 4) return { label: 'Very Good', color: '#3498db' };
    if (rating >= 3) return { label: 'Good', color: '#f39c12' };
    if (rating >= 2) return { label: 'Fair', color: '#e67e22' };
    return { label: 'Poor', color: '#e74c3c' };
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
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Ratings Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Rated Users
              </Typography>
              <Typography variant="h5">
                {stats.totalUserRatings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg User Rating
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating value={parseFloat(stats.avgUserRating) / 5 * 5} readOnly precision={0.5} />
                <Typography variant="h5">{stats.avgUserRating}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Rated Posts
              </Typography>
              <Typography variant="h5">
                {stats.totalPostRatings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Post Rating
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating value={parseFloat(stats.avgPostRating) / 5 * 5} readOnly precision={0.5} />
                <Typography variant="h5">{stats.avgPostRating}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab label={`User Ratings (${stats.totalUserRatings})`} />
          <Tab label={`Post Ratings (${stats.totalPostRatings})`} />
        </Tabs>
      </Box>

      {/* User Ratings Table */}
      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>User ID</strong></TableCell>
                <TableCell align="center"><strong>Avg Rating</strong></TableCell>
                <TableCell align="center"><strong>Total Ratings</strong></TableCell>
                <TableCell align="center"><strong>Total Feedback</strong></TableCell>
                <TableCell align="center"><strong>Category</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userRatings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    No user ratings found
                  </TableCell>
                </TableRow>
              ) : (
                userRatings.map((rating) => {
                  const category = getRatingCategory(rating.averageRating || 0);
                  return (
                    <TableRow key={rating.userId} hover>
                      <TableCell>#{rating.userId}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <Rating value={(rating.averageRating || 0) / 5 * 5} readOnly size="small" precision={0.5} />
                          <Typography>{(rating.averageRating || 0).toFixed(2)}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">{rating.totalRatings || 0}</TableCell>
                      <TableCell align="center">{rating.totalFeedback || 0}</TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: `${category.color}20`,
                            color: category.color,
                            fontWeight: 'bold'
                          }}
                        >
                          {category.label}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Post Ratings Table */}
      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Post ID</strong></TableCell>
                <TableCell align="center"><strong>Avg Rating</strong></TableCell>
                <TableCell align="center"><strong>Total Ratings</strong></TableCell>
                <TableCell align="center"><strong>Total Feedback</strong></TableCell>
                <TableCell align="center"><strong>Category</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {postRatings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    No post ratings found
                  </TableCell>
                </TableRow>
              ) : (
                postRatings.map((rating) => {
                  const category = getRatingCategory(rating.averageRating || 0);
                  return (
                    <TableRow key={rating.postId} hover>
                      <TableCell>#{rating.postId}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <Rating value={(rating.averageRating || 0) / 5 * 5} readOnly size="small" precision={0.5} />
                          <Typography>{(rating.averageRating || 0).toFixed(2)}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">{rating.totalRatings || 0}</TableCell>
                      <TableCell align="center">{rating.totalFeedback || 0}</TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: `${category.color}20`,
                            color: category.color,
                            fontWeight: 'bold'
                          }}
                        >
                          {category.label}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AdminRatingsPage;
