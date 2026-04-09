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
} from '@mui/material';
import { format } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

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

const AdminSystemLogsPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

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

  const getTypeColor = (type) => {
    const lowerType = type?.toLowerCase();
    switch (lowerType) {
      case 'error': return '#ff9b9b';
      case 'warning': return '#ffc857';
      case 'info': return C.bright;
      case 'success': return C.bright;
      default: return C.bright;
    }
  };

  const getTypeBackground = (type) => {
    const lowerType = type?.toLowerCase();
    switch (lowerType) {
      case 'error': return 'rgba(255,107,107,0.2)';
      case 'warning': return 'rgba(255,200,87,0.2)';
      case 'info': return 'rgba(100,255,67,0.15)';
      case 'success': return 'rgba(100,255,67,0.2)';
      default: return 'rgba(100,255,67,0.15)';
    }
  };

  const filteredLogs = logs.filter(log =>
    search === '' || 
    log.action?.toLowerCase().includes(search.toLowerCase()) ||
    log.type?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', background: C.darker, display: 'flex', justifyContent: 'center', alignItems: 'center', color: C.text }}>
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
            ◈ System Logs
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: C.textMid }}>
            View all system activity and events
          </Typography>
        </Box>

        {/* Controls */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
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
                backgroundColor: `${C.darker}ee`,
                '& fieldset': { borderColor: C.border },
                '&:hover fieldset': { borderColor: C.borderHover },
                '&.Mui-focused fieldset': { borderColor: C.bright }
              },
              '& .MuiOutlinedInput-input::placeholder': {
                color: C.textLow,
                opacity: 1
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: C.textMid, mr: 1 }} />
                </InputAdornment>
              )
            }}
          />

          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchLogs}
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
            Refresh
          </Button>
        </Box>

        {error && (
          <Box sx={{ p: 2.5, background: 'rgba(255,67,67,0.12)', border: `1px solid rgba(255,67,67,0.35)`, borderRadius: '12px', mb: 3, color: '#ff9b9b' }}>
            <Typography sx={{ fontSize: '0.9rem' }}>{error}</Typography>
          </Box>
        )}

        {/* Log count */}
        <Typography sx={{ fontSize: '0.9rem', color: C.textMid, mb: 3 }}>
          Found {filteredLogs.length} of {logs.length} logs
        </Typography>

        {/* Logs Table */}
        {filteredLogs.length > 0 ? (
          <Box sx={{ backgroundColor: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: `rgba(100,255,67,0.08)`, borderBottom: `2px solid ${C.border}` }}>
                    <TableCell sx={{ color: C.bright, fontWeight: 600, fontSize: '0.9rem' }}>Type</TableCell>
                    <TableCell sx={{ color: C.bright, fontWeight: 600, fontSize: '0.9rem' }}>Action</TableCell>
                    <TableCell sx={{ color: C.bright, fontWeight: 600, fontSize: '0.9rem' }}>User ID</TableCell>
                    <TableCell sx={{ color: C.bright, fontWeight: 600, fontSize: '0.9rem' }}>Details</TableCell>
                    <TableCell sx={{ color: C.bright, fontWeight: 600, fontSize: '0.9rem' }}>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLogs.map((log, idx) => (
                    <TableRow
                      key={log.id || idx}
                      sx={{
                        borderBottom: `1px solid ${C.border}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: `${C.glow}`,
                          borderBottomColor: C.borderHover
                        }
                      }}
                    >
                      <TableCell>
                        <Chip
                          label={log.type || 'Info'}
                          size="small"
                          sx={{
                            background: getTypeBackground(log.type),
                            color: getTypeColor(log.type),
                            fontWeight: 500,
                            fontSize: '0.8rem'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: C.text, fontSize: '0.9rem', fontWeight: 500 }}>
                        {log.action || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ color: C.textMid, fontSize: '0.9rem' }}>
                        {log.userId ? `#${log.userId}` : 'System'}
                      </TableCell>
                      <TableCell sx={{ color: C.textMid, fontSize: '0.85rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.details || '—'}
                      </TableCell>
                      <TableCell sx={{ color: C.textMid, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {log.createdAt ? format(new Date(log.createdAt), 'MMM d, HH:mm') : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6, backgroundColor: C.surface, borderRadius: '12px', border: `1px solid ${C.border}` }}>
            <Typography sx={{ color: C.textMid, fontSize: '1rem' }}>
              {search ? 'No logs found matching your search' : 'No logs available'}
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default AdminSystemLogsPage;

