import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Button,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { format } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';

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
  warning: '#d97706',
  warningBg: 'rgba(217,119,6,0.08)',
  info: '#2563eb',
  infoBg: 'rgba(37,99,235,0.08)',
  success: '#2e7d32',
  successBg: 'rgba(46,125,50,0.08)',
  // Glows
  glow: 'rgba(46,125,50,0.04)',
  glowStrong: 'rgba(46,125,50,0.12)',
};

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
        navigate('/admin/login');
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
    switch (type?.toLowerCase()) {
      case 'error': return C.error;
      case 'warning': return C.warning;
      case 'info': return C.info;
      case 'success': return C.success;
      default: return C.bright;
    }
  };

  const getTypeBackground = (type) => {
    switch (type?.toLowerCase()) {
      case 'error': return C.errorBg;
      case 'warning': return C.warningBg;
      case 'info': return C.infoBg;
      case 'success': return C.successBg;
      default: return C.glow;
    }
  };

  const filteredLogs = logs.filter(log =>
    search === '' ||
    log.action?.toLowerCase().includes(search.toLowerCase()) ||
    log.type?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', background: C.darker, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: C.bright }} />
          <Typography sx={{ color: C.textMid, mt: 2, fontSize: '0.9rem' }}>Loading logs...</Typography>
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
              Monitoring
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
            System Logs
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: C.textMid }}>
            View all system activity and events
          </Typography>
        </Box>

        {/* Controls */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{
              flex: 1,
              maxWidth: '400px',
              '& .MuiOutlinedInput-root': {
                color: C.text,
                backgroundColor: C.surfaceHigh,
                '& fieldset': { borderColor: C.border },
                '&:hover fieldset': { borderColor: C.borderHover },
                '&.Mui-focused fieldset': { borderColor: C.bright }
              },
              '& .MuiOutlinedInput-input::placeholder': { color: C.textLow, opacity: 1 }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: C.textMid, mr: 1, fontSize: '1.1rem' }} />
                </InputAdornment>
              )
            }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              startIcon={<RefreshIcon />}
              onClick={fetchLogs}
              sx={{
                background: C.glow,
                color: C.bright,
                border: `1px solid ${C.border}`,
                textTransform: 'none',
                px: 3,
                py: 0.8,
                borderRadius: '8px',
                transition: 'all 0.2s',
                '&:hover': {
                  background: C.surfaceHigh,
                  borderColor: C.bright,
                  boxShadow: `0 0 20px ${C.glow}`
                }
              }}
            >
              Refresh
            </Button>

            <Button
              startIcon={<DeleteIcon />}
              onClick={() => setClearDialogOpen(true)}
              disabled={logs.length === 0 || clearing}
              sx={{
                background: C.errorBg,
                color: C.error,
                border: `1px solid ${C.error}33`,
                textTransform: 'none',
                px: 3,
                py: 0.8,
                borderRadius: '8px',
                transition: 'all 0.2s',
                '&:hover': {
                  background: C.errorBg,
                  borderColor: C.error,
                },
                '&:disabled': { opacity: 0.4 }
              }}
            >
              Clear Logs
            </Button>
          </Box>
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

        <Typography sx={{ fontSize: '0.85rem', color: C.textMid, mb: 3 }}>
          Found {filteredLogs.length} of {logs.length} logs
        </Typography>

        {/* Logs Table */}
        {filteredLogs.length > 0 ? (
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
                    {['Type', 'Action', 'User ID', 'Details', 'Timestamp'].map((h) => (
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
                  {filteredLogs.map((log, idx) => (
                    <TableRow
                      key={log.id || idx}
                      sx={{
                        borderBottom: `1px solid ${C.border}`,
                        transition: 'all 0.2s ease',
                        animation: `fadeUp 0.3s ease ${idx * 0.02}s both`,
                        '&:hover': { backgroundColor: C.glow }
                      }}
                    >
                      <TableCell>
                        <Chip
                          label={log.type || 'Info'}
                          size="small"
                          sx={{
                            background: getTypeBackground(log.type),
                            color: getTypeColor(log.type),
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            borderRadius: '100px',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: C.text, fontSize: '0.85rem', fontWeight: 500 }}>
                        {log.action || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ color: C.textMid, fontSize: '0.85rem' }}>
                        {log.userId ? `#${log.userId}` : 'System'}
                      </TableCell>
                      <TableCell sx={{
                        color: C.textMid,
                        fontSize: '0.8rem',
                        maxWidth: '250px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {log.details || '—'}
                      </TableCell>
                      <TableCell sx={{ color: C.textMid, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {log.createdAt ? format(new Date(log.createdAt), 'MMM d, HH:mm') : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Box sx={{
            textAlign: 'center',
            py: 6,
            backgroundColor: C.surface,
            borderRadius: '16px',
            border: `1px solid ${C.border}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <Box sx={{ fontSize: 48, mb: 2 }}>📋</Box>
            <Typography sx={{ color: C.textMid, fontSize: '1rem' }}>
              {search ? 'No logs found matching your search' : 'No logs available'}
            </Typography>
          </Box>
        )}
      </Container>

      {/* Clear Logs Confirmation Dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
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
          fontWeight: 700,
          color: C.error,
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.5rem',
        }}>
          Clear All Logs?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: C.textMid, mt: 1 }}>
            Are you sure you want to permanently delete all system logs? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setClearDialogOpen(false)}
            disabled={clearing}
            sx={{
              color: C.textMid,
              border: `1px solid ${C.border}`,
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': { borderColor: C.bright, color: C.bright }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={clearLogs}
            disabled={clearing}
            sx={{
              background: C.errorBg,
              color: C.error,
              border: `1px solid ${C.error}33`,
              textTransform: 'none',
              borderRadius: '8px',
              px: 3,
              '&:hover': { background: C.errorBg, borderColor: C.error },
              '&:disabled': { opacity: 0.5 }
            }}
          >
            {clearing ? 'Clearing...' : 'Clear All Logs'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSystemLogsPage;