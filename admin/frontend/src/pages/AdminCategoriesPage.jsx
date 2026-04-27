import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

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
  // Glows
  glow: 'rgba(46,125,50,0.04)',
  glowStrong: 'rgba(46,125,50,0.12)',
};

const AdminCategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }

      // Get categories from admin backend
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5498/api'}/admin/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      setCategories(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingId(category.id);
      setFormData({ name: category.name, description: category.description || '' });
    } else {
      setEditingId(null);
      setFormData({ name: '', description: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const method = editingId ? 'PUT' : 'POST';
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5498/api';
      const url = editingId
        ? `${apiUrl}/admin/categories/${editingId}`
        : `${apiUrl}/admin/categories`;

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save category');

      handleCloseDialog();
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5498/api'}/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete category');

      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', background: C.darker, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: C.bright }} />
          <Typography sx={{ color: C.textMid, mt: 2, fontSize: '0.9rem' }}>Loading categories...</Typography>
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ animation: 'fadeUp 0.7s ease both' }}>
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
              Waste Categories
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', color: C.textMid }}>
              Manage material waste categories
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: C.bright,
              color: '#ffffff',
              fontWeight: 700,
              borderRadius: '8px',
              textTransform: 'none',
              px: 3,
              py: 1,
              boxShadow: `0 2px 8px ${C.glowStrong}`,
              transition: 'all 0.2s',
              '&:hover': {
                background: C.brightDark,
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${C.glowStrong}`
              }
            }}
          >
            Add Category
          </Button>
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

        {/* Categories Table */}
        <Box sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          border: `1px solid ${C.border}`,
          background: C.surface,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          {categories.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center', color: C.textMid }}>
              <Box sx={{ fontSize: 48, mb: 2 }}>📦</Box>
              <Typography>No categories found</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ background: 'transparent' }}>
              <Table sx={{ '& .MuiTableCell-root': { borderColor: C.border } }}>
                <TableHead>
                  <TableRow sx={{ background: C.surfaceHigh }}>
                    <TableCell sx={{ color: C.bright, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Category Name</TableCell>
                    <TableCell sx={{ color: C.bright, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Description</TableCell>
                    <TableCell align="right" sx={{ color: C.bright, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((category, index) => (
                    <TableRow
                      key={category.id}
                      sx={{
                        '&:hover': { background: C.glow },
                        animation: `fadeUp 0.3s ease ${index * 0.05}s both`,
                      }}
                    >
                      <TableCell sx={{ color: C.bright, fontWeight: 600 }}>{category.name}</TableCell>
                      <TableCell sx={{ color: C.textMid }}>{category.description || 'N/A'}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(category)}
                          sx={{
                            color: C.bright,
                            '&:hover': { background: C.glow },
                            mr: 1
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(category.id)}
                          sx={{
                            color: C.error,
                            '&:hover': { background: C.errorBg }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Add/Edit Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: C.surface,
              border: `1px solid ${C.border}`,
              color: C.text,
              borderRadius: '16px',
              boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)',
            }
          }}
        >
          <DialogTitle sx={{
            color: C.bright,
            fontWeight: 700,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.5rem',
            pb: 1
          }}>
            {editingId ? '✎ Edit Category' : '◎ Add New Category'}
          </DialogTitle>
          <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: C.text,
                  backgroundColor: C.surfaceHigh,
                  '& fieldset': { borderColor: C.border },
                  '&:hover fieldset': { borderColor: C.borderHover },
                  '&.Mui-focused fieldset': { borderColor: C.bright }
                },
                '& .MuiInputLabel-root': { color: C.textMid },
                '& .MuiInputLabel-root.Mui-focused': { color: C.bright }
              }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: C.text,
                  backgroundColor: C.surfaceHigh,
                  '& fieldset': { borderColor: C.border },
                  '&:hover fieldset': { borderColor: C.borderHover },
                  '&.Mui-focused fieldset': { borderColor: C.bright }
                },
                '& .MuiInputLabel-root': { color: C.textMid },
                '& .MuiInputLabel-root.Mui-focused': { color: C.bright }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{
                color: C.textMid,
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': {
                  background: C.glow,
                  color: C.bright
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              sx={{
                background: C.bright,
                color: '#ffffff',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '8px',
                px: 3,
                boxShadow: `0 2px 8px ${C.glowStrong}`,
                transition: 'all 0.2s',
                '&:hover': {
                  background: C.brightDark,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${C.glowStrong}`
                }
              }}
            >
              {editingId ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminCategoriesPage;