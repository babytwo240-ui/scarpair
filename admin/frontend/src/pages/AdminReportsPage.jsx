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

      const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/reports`, {
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
        return { label: 'Pending', bgColor: 'rgba(255,200,100,0.15)', textColor: '#ffc864' };
      case 'resolved': 
        return { label: 'Resolved', bgColor: 'rgba(100,255,67,0.15)', textColor: C.bright };
      case 'dismissed': 
        return { label: 'Dismissed', bgColor: 'rgba(200,200,200,0.15)', textColor: '#c0c0c0' };
      default: 
        return { label: 'Pending', bgColor: 'rgba(255,200,100,0.15)', textColor: '#ffc864' };
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
        <Box sx={{ mb: 5 }}>
          <Typography sx={{ fontSize: '3rem', fontWeight: 900, color: C.bright, mb: 1 }}>
            ◉ Reports Management
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: C.textMid }}>
            Review and manage user reports
          </Typography>
        </Box>

        {error && (
          <Box sx={{ p: 2.5, background: 'rgba(255,67,67,0.12)', border: `1px solid rgba(255,67,67,0.35)`, borderRadius: '12px', mb: 3, color: '#ff9b9b' }}>
            {error}
          </Box>
        )}

        {/* Reports Table */}
        <Box sx={{
          borderRadius: '14px',
          overflow: 'hidden',
          border: `1px solid ${C.border}`,
          background: `linear-gradient(135deg, ${C.surface} 0%, rgba(18,77,5,0.4) 100%)`,
          backdropFilter: 'blur(8px)',
        }}>
          {reports.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: C.textMid }}>
              No reports found
            </Box>
          ) : (
            <TableContainer sx={{ background: 'transparent' }}>
              <Table sx={{ '& .MuiTableCell-root': { borderColor: C.border } }}>
                <TableHead>
                  <TableRow sx={{ background: 'rgba(12,34,2,0.8)' }}>
                    <TableCell sx={{ color: C.bright, fontWeight: 700 }}>Report ID</TableCell>
                    <TableCell sx={{ color: C.bright, fontWeight: 700 }}>Reported User</TableCell>
                    <TableCell sx={{ color: C.bright, fontWeight: 700 }}>Reporter</TableCell>
                    <TableCell sx={{ color: C.bright, fontWeight: 700 }}>Reason</TableCell>
                    <TableCell sx={{ color: C.bright, fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ color: C.bright, fontWeight: 700 }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => {
                    const statusChip = getStatusChip(report.status);
                    return (
                      <TableRow key={report.id} sx={{ '&:hover': { background: `rgba(100,255,67,0.05)` } }}>
                        <TableCell sx={{ color: C.text }}>#{report.id}</TableCell>
                        <TableCell sx={{ color: C.text }}>User #{report.reportedUserId}</TableCell>
                        <TableCell sx={{ color: C.text }}>User #{report.reporterId}</TableCell>
                        <TableCell sx={{ color: C.textMid }}>{report.reason || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={statusChip.label}
                            sx={{ backgroundColor: statusChip.bgColor, color: statusChip.textColor, fontWeight: 600 }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ color: C.textMid, fontSize: '0.9rem' }}>
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

