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
  Paper,
  Chip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { format } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';

const AdminSystemLogsPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5498/api'}/admin/logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      setLogs(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    setClearing(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5498/api'}/admin/logs`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setLogs([]);
        setClearDialogOpen(false);
        setError('');
        // Optionally show success message
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to clear logs');
      }
    } catch (err) {
      setError(err.message || 'Failed to clear logs');
    } finally {
      setClearing(false);
    }
  };

  const getTypeColor = (type) => {
    const lowerType = type?.toLowerCase();
    switch (lowerType) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'success': return 'success';
      default: return 'default';
    }
  };

  const filteredLogs = logs.filter(log =>
    search === '' || 
    log.action?.toLowerCase().includes(search.toLowerCase()) ||
    log.type?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          System Logs
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchLogs}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setClearDialogOpen(true)}
            disabled={logs.length === 0 || clearing}
          >
            Clear Logs
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search logs by action or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
          }}
        />
      </Box>

      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        Found {filteredLogs.length} of {logs.length} logs
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
              <TableCell><strong>User ID</strong></TableCell>
              <TableCell><strong>Details</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  {search ? 'No logs found matching your search' : 'No logs found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log, idx) => (
                <TableRow key={log.id || idx} hover>
                  <TableCell>
                    <Chip
                      label={log.type || 'Info'}
                      color={getTypeColor(log.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell><strong>{log.action || 'N/A'}</strong></TableCell>
                  <TableCell>{log.userId ? `#${log.userId}` : 'System'}</TableCell>
                  <TableCell>{log.details || 'N/A'}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>
                    {log.createdAt ? format(new Date(log.createdAt), 'MMM d, yyyy HH:mm') : 'N/A'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Clear All Logs?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>
            Are you sure you want to permanently delete all system logs? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setClearDialogOpen(false)}
            disabled={clearing}
          >
            Cancel
          </Button>
          <Button
            onClick={clearLogs}
            variant="contained"
            color="error"
            disabled={clearing}
          >
            {clearing ? 'Clearing...' : 'Clear All Logs'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminSystemLogsPage;

