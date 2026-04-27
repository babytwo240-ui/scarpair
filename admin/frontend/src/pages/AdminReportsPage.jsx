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
  Button
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
  // Status colors
  pending: '#d97706',
  pendingBg: 'rgba(217,119,6,0.08)',
  resolved: '#2e7d32',
  resolvedBg: 'rgba(46,125,50,0.08)',
  dismissed: '#94a3b8',
  dismissedBg: 'rgba(148,163,184,0.08)',
  // Glows
  glow: 'rgba(46,125,50,0.04)',
  glowStrong: 'rgba(46,125,50,0.12)',
};

const AdminReportsPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5498/api'}/admin/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      setReports(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { label: 'Pending', bgColor: C.pendingBg, textColor: C.pending };
      case 'resolved':
        return { label: 'Resolved', bgColor: C.resolvedBg, textColor: C.resolved };
      case 'dismissed':
        return { label: 'Dismissed', bgColor: C.dismissedBg, textColor: C.dismissed };
      default:
        return { label: 'Pending', bgColor: C.pendingBg, textColor: C.pending };
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', background: C.darker, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: C.bright }} />
          <Typography sx={{ color: C.textMid, mt: 2, fontSize: '0.9rem' }}>Loading reports...</Typography>
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
            Reports Management
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: C.textMid }}>
            Review and manage user reports
          </Typography>
        </Box>

        {error && (
          <Box sx={{
            p: 2.5,
            background: 'rgba(220,38,38,0.08)',
            border: '1px solid rgba(220,38,38,0.25)',
            borderRadius: '12px',
            mb: 3,
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="#dc2626" strokeWidth="2" />
              <path d="M10 6v4M10 14h.01" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>{error}</span>
          </Box>
        )}

        {/* Reports Table */}
        <Box sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          border: `1px solid ${C.border}`,
          background: C.surface,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          animation: 'fadeUp 0.7s ease 0.1s both',
        }}>
          {reports.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center', color: C.textMid }}>
              <Box sx={{ fontSize: 48, mb: 2 }}>📋</Box>
              <Typography>No reports found</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ background: 'transparent' }}>
              <Table sx={{
                '& .MuiTableCell-root': { borderColor: C.border },
                '& .MuiTableRow-root': { transition: 'background 0.2s' },
              }}>
                <TableHead>
                  <TableRow sx={{ background: C.surfaceHigh }}>
                    <TableCell sx={{ color: C.bright, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Report ID</TableCell>
                    <TableCell sx={{ color: C.bright, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Reported User</TableCell>
                    <TableCell sx={{ color: C.bright, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Reporter</TableCell>
                    <TableCell sx={{ color: C.bright, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Reason</TableCell>
                    <TableCell sx={{ color: C.bright, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Status</TableCell>
                    <TableCell sx={{ color: C.bright, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report, index) => {
                    const statusChip = getStatusChip(report.status);
                    return (
                      <TableRow
                        key={report.id}
                        sx={{
                          '&:hover': { background: C.glow },
                          animation: `fadeUp 0.3s ease ${index * 0.03}s both`,
                        }}
                      >
                        <TableCell sx={{ color: C.text, fontWeight: 500 }}>#{report.id}</TableCell>
                        <TableCell sx={{ color: C.text }}>User #{report.reportedUserId}</TableCell>
                        <TableCell sx={{ color: C.text }}>User #{report.reporterId}</TableCell>
                        <TableCell sx={{ color: C.textMid }}>{report.reason || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={statusChip.label}
                            sx={{
                              backgroundColor: statusChip.bgColor,
                              color: statusChip.textColor,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 24,
                              borderRadius: '100px',
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ color: C.textMid, fontSize: '0.85rem' }}>
                          {report.createdAt ? format(new Date(report.createdAt), 'MMM d, yyyy') : 'N/A'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default AdminReportsPage;