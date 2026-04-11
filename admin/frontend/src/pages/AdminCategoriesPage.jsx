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
      const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/categories`, {
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
      const apiUrl = process.env.REACT_APP_API_URL;
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

      const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/categories/${id}`, {
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
          <Box>
            <Typography sx={{ fontSize: '3rem', fontWeight: 900, color: C.bright, mb: 1 }}>
              ◐ Waste Categories
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', color: C.textMid }}>
              Manage material waste categories
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ background: C.bright, color: '#082800', fontWeight: 700, '&:hover': { background: '#7fff5c' } }}
          >
            Add Category
          </Button>
        </Box>

        {error && (
          <Box sx={{ p: 2.5, background: 'rgba(255,67,67,0.12)', border: `1px solid rgba(255,67,67,0.35)`, borderRadius: '12px', mb: 3, color: '#ff9b9b' }}>
            {error}
          </Box>
        )}

        {/* Categories Table */}
        <Box sx={{
          borderRadius: '14px',
          overflow: 'hidden',
          border: `1px solid ${C.border}`,
          background: `linear-gradient(135deg, ${C.surface} 0%, rgba(18,77,5,0.4) 100%)`,
          backdropFilter: 'blur(8px)',
        }}>
          {categories.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: C.textMid }}>
              No categories found
            </Box>
          ) : (
            <TableContainer sx={{ background: 'transparent' }}>
              <Table sx={{ '& .MuiTableCell-root': { borderColor: C.border } }}>
                <TableHead>
                  <TableRow sx={{ background: 'rgba(12,34,2,0.8)' }}>
                    <TableCell sx={{ color: C.bright, fontWeight: 700 }}>Category Name</TableCell>
                    <TableCell sx={{ color: C.bright, fontWeight: 700 }}>Description</TableCell>
                    <TableCell align="right" sx={{ color: C.bright, fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id} sx={{ '&:hover': { background: `rgba(100,255,67,0.05)` } }}>
                      <TableCell sx={{ color: C.bright, fontWeight: 600 }}>{category.name}</TableCell>
                      <TableCell sx={{ color: C.textMid }}>{category.description || 'N/A'}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(category)}
                          sx={{ color: C.bright, '&:hover': { background: `${C.bright}22` } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(category.id)}
                          sx={{ color: '#ff6464', '&:hover': { background: 'rgba(255,100,100,0.15)' } }}
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
              background: `linear-gradient(135deg, ${C.surface} 0%, rgba(18,77,5,0.5) 100%)`,
              border: `1px solid ${C.border}`,
              color: C.text,
              backdropFilter: 'blur(8px)',
            }
          }}
        >
          <DialogTitle sx={{ color: C.bright, fontWeight: 700 }}>
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
                  '& fieldset': { borderColor: C.border },
                  '&:hover fieldset': { borderColor: C.borderHover },
                  background: 'rgba(13,56,6,0.6)',
                },
                '& .MuiInputLabel-root': { color: C.textMid },
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
                  '& fieldset': { borderColor: C.border },
                  '&:hover fieldset': { borderColor: C.borderHover },
                  background: 'rgba(13,56,6,0.6)',
                },
                '& .MuiInputLabel-root': { color: C.textMid },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button 
              onClick={handleCloseDialog}
              sx={{ color: C.textMid, '&:hover': { background: `${C.border}` } }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained"
              sx={{ background: C.bright, color: '#082800', fontWeight: 700, '&:hover': { background: '#7fff5c' } }}
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

