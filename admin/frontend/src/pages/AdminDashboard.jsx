import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  Chip,
  LinearProgress
} from '@mui/material';
import { format } from 'date-fns';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// ── Design Tokens (70% White / 30% Green Palette) ─────────────────────
const C = {
  // Primary green accent (30%)
  accent: '#2e7d32',        // Deep green for primary actions
  accentDim: '#1b5e20',     // Darker green for hover/dim
  accentGlow: 'rgba(46,125,50,0.12)',
  accentGlowStrong: 'rgba(46,125,50,0.25)',
  accentSoft: 'rgba(46,125,50,0.06)',

  // Backgrounds (White/Grey tones for 70% white feel)
  pageBg: '#f8fafc',        // Light grey-white background
  sidebar: '#ffffff',       // Pure white sidebar
  card: '#ffffff',          // White cards
  cardElevated: '#f1f5f9',  // Slightly grey elevated surfaces
  surface: '#f8fafc',       // Light surfaces
  surfaceHover: '#f1f5f9',  // Hover state

  // Borders (Soft grey-green)
  border: 'rgba(0,0,0,0.08)',
  borderMid: 'rgba(0,0,0,0.12)',
  borderHover: 'rgba(46,125,50,0.25)',

  // Text (Dark grey for high contrast on white)
  textPrimary: '#0f172a',   // Slate 900
  textSecondary: '#475569', // Slate 600
  textMuted: '#94a3b8',     // Slate 400
  textInverse: '#ffffff',   // White text on green backgrounds

  // Status colors (Adjusted to match the palette)
  blue: '#2563eb',          // Vibrant blue for business type
  blueDim: 'rgba(37,99,235,0.08)',
  amber: '#d97706',         // Amber for artist
  amberDim: 'rgba(217,119,6,0.08)',
  red: '#dc2626',           // Red for delete/danger
  redDim: 'rgba(220,38,38,0.08)',
  purple: '#8b5cf6',        // Purple accent
  purpleDim: 'rgba(139,92,246,0.08)',
};

// ── Keyframe CSS injected once ────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  @keyframes pulse-ring {
    0% { box-shadow: 0 0 0 0 rgba(46,125,50,0.2); }
    70% { box-shadow: 0 0 0 8px rgba(46,125,50,0); }
    100% { box-shadow: 0 0 0 0 rgba(46,125,50,0); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes dotBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  * { box-sizing: border-box; }
  body { background: #f8fafc; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: #e2e8f0; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;

// ── Shared sx helpers ────────────────────────────────────────────────
const cardBase = {
  background: C.card,
  borderRadius: '20px',
  border: `1px solid ${C.border}`,
  overflow: 'hidden',
  transition: 'border-color 0.25s, box-shadow 0.25s, transform 0.2s',
  '&:hover': {
    borderColor: C.borderMid,
    boxShadow: `0 8px 20px rgba(0,0,0,0.05)`,
    transform: 'translateY(-2px)',
  },
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    background: C.surface,
    borderRadius: '12px',
    fontSize: '0.85rem',
    color: C.textPrimary,
    fontFamily: "'Syne', sans-serif",
    '& fieldset': { borderColor: C.border },
    '&:hover fieldset': { borderColor: C.borderMid },
    '&.Mui-focused fieldset': { borderColor: C.accent, boxShadow: `0 0 0 3px ${C.accentGlow}` },
  },
  '& .MuiInputLabel-root': { color: C.textSecondary, fontSize: '0.82rem', fontFamily: "'Syne', sans-serif" },
  '& .MuiInputLabel-root.Mui-focused': { color: C.accent },
  '& .MuiSvgIcon-root': { color: C.textMuted },
  '& .MuiSelect-icon': { color: C.textMuted },
  '& .MuiMenuItem-root': { fontFamily: "'Syne', sans-serif" },
};

// ── Sub-components ────────────────────────────────────────────────────

/** Thin animated top-bar loading indicator */
const TopLoadBar = ({ active }) => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '2px',
      zIndex: 9999,
      background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
      backgroundSize: '200% 100%',
      animation: active ? 'shimmer 1.4s linear infinite' : 'none',
      opacity: active ? 1 : 0,
      transition: 'opacity 0.4s',
    }}
  />
);

/** Stat KPI card */
const StatCard = ({ label, value, delta, icon, color, bg, loading }) => (
  <Box
    sx={{
      ...cardBase,
      background: bg,
      border: 'none',
      p: 3,
      cursor: 'default',
      animation: 'fadeSlideUp 0.5s ease both',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 20px 25px -12px rgba(0,0,0,0.1)`,
      },
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
      <Typography
        sx={{
          fontSize: '0.68rem',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.7)',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          fontFamily: "'DM Mono', monospace",
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '17px',
          color: '#fff',
        }}
      >
        {icon}
      </Box>
    </Box>
    <Typography
      sx={{
        fontSize: '2.4rem',
        fontWeight: 800,
        color: '#fff',
        lineHeight: 1,
        fontFamily: "'Syne', sans-serif",
        letterSpacing: '-1px',
        mb: 1.5,
      }}
    >
      {loading ? <CircularProgress size={22} sx={{ color: 'rgba(255,255,255,0.8)' }} /> : value}
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
      <Box
        sx={{
          px: 1,
          py: 0.3,
          borderRadius: '6px',
          background: 'rgba(255,255,255,0.2)',
          fontSize: '0.7rem',
          fontWeight: 600,
          color: '#fff',
          fontFamily: "'DM Mono', monospace",
        }}
      >
        {delta}
      </Box>
    </Box>
  </Box>
);

/** Live dot */
const LiveDot = () => (
  <Box
    sx={{
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: C.accent,
      animation: 'pulse-ring 2s ease-out infinite, dotBlink 2s ease-in-out infinite',
      flexShrink: 0,
    }}
  />
);

// ── Main Component ────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const limit = 50;

  // Inject global styles once
  useEffect(() => {
    const tag = document.createElement('style');
    tag.innerHTML = globalStyles;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5498/api';
      const [usersRes, statsRes] = await Promise.all([
        fetch(`${apiUrl}/admin/users?${queryParams}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/admin/statistics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!usersRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const usersData = await usersRes.json();
      const statsData = await statsRes.json();

      setUsers(usersData.users || []);
      setStats(statsData.data || {});
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get stat values safely
  const getStatValue = (key) => stats?.[key] || 0;

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    const matchesType = filterType === 'all' || user.type === filterType;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive) ||
      (filterStatus === 'verified' && user.isVerified) ||
      (filterStatus === 'unverified' && !user.isVerified);
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleViewDetails = (userId) => navigate(`/admin/users/${userId}`);

  const handleVerifyUser = async (userId, currentStatus) => {
    const action = currentStatus ? 'unverify' : 'verify';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5498/api'}/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: !currentStatus })
      });
      if (!response.ok) throw new Error('Failed to update verification status');
      await fetchData();
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to update verification status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all their data? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5498/api'}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete user');
      await fetchData();
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  // Analytics
  const totalUsers = stats ? getStatValue('totalUsers') : users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const verifiedUsers = users.filter(u => u.isVerified).length;
  const verificationRate = users.length > 0 ? Math.round((verifiedUsers / users.length) * 100) : 0;

  const businessCount = users.filter(u => u.type === 'business').length;
  const recyclerCount = users.filter(u => u.type === 'recycler').length;
  const artistCount = users.filter(u => u.type === 'artist').length;

  const userTypePie = [
    { name: 'Business', value: businessCount, color: C.blue },
    { name: 'Recycler', value: recyclerCount, color: C.accent },
    { name: 'Artist', value: artistCount, color: C.amber },
  ].filter(d => d.value > 0);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyReg = days.map((day, idx) => ({
    day,
    registrations: users.filter(u => {
      try { return new Date(u.createdAt).getDay() === idx; } catch { return false; }
    }).length,
  }));

  // Material stats from API
  const totalPlastic = getStatValue('totalPlastic');
  const totalMetal = getStatValue('totalMetal');
  const totalBronze = getStatValue('totalBronze');
  const totalGlass = getStatValue('totalGlass');
  const totalRubber = getStatValue('totalRubber');
  const totalTextile = getStatValue('totalTextile');

  const totalCollectedAll = totalPlastic + totalMetal + totalBronze + totalGlass + totalRubber + totalTextile;

  const navGroups = [
    {
      heading: 'Overview',
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', emoji: '⬡' },
        { label: 'Reports', path: '/admin/reports', emoji: '◫' },
      ],
    },
    {
      heading: 'Management',
      items: [
        { label: 'Users', path: '/admin/users', emoji: '◈' },
        { label: 'Ratings', path: '/admin/ratings', emoji: '◇' },
        { label: 'Categories', path: '/admin/categories', emoji: '▦' },
        { label: 'System Logs', path: '/admin/logs', emoji: '⬕' },
      ],
    },
  ];

  const sidebarW = 248;

  // ── Custom tooltip ────────────────────────────────────────────────
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{
          background: C.cardElevated,
          border: `1px solid ${C.borderMid}`,
          borderRadius: '12px',
          p: 1.5,
          boxShadow: `0 8px 24px rgba(0,0,0,0.1)`,
        }}>
          <Typography sx={{ color: C.textSecondary, fontSize: '0.72rem', fontFamily: "'DM Mono', monospace", mb: 0.5 }}>{label}</Typography>
          <Typography sx={{ color: C.accent, fontWeight: 700, fontSize: '1.1rem', fontFamily: "'Syne', sans-serif" }}>
            {payload[0].value}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: C.pageBg,
        fontFamily: "'Syne', sans-serif",
      }}
    >
      <TopLoadBar active={loading} />

      {/* ══ SIDEBAR (White) ════════════════════════════════════════════ */}
      <Box
        sx={{
          width: sidebarW,
          minWidth: sidebarW,
          background: C.sidebar,
          borderRight: `1px solid ${C.border}`,
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <Box
          onClick={() => navigate('/admin/dashboard')}
          sx={{
            px: 3,
            py: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            borderBottom: `1px solid ${C.border}`,
            cursor: 'pointer',
            transition: 'background 0.2s',
            '&:hover': { background: C.accentSoft },
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentDim} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: `0 4px 10px ${C.accentGlow}`,
              flexShrink: 0,
            }}
          >
            ♻️
          </Box>
          <Box>
            <Typography
              sx={{
                color: C.textPrimary,
                fontWeight: 800,
                fontSize: '1rem',
                lineHeight: 1.1,
                fontFamily: "'Syne', sans-serif",
                letterSpacing: '-0.3px',
              }}
            >
              Scarpair
            </Typography>
            <Typography
              sx={{
                color: C.textMuted,
                fontSize: '0.68rem',
                fontFamily: "'DM Mono', monospace",
                letterSpacing: '0.5px',
              }}
            >
              ADMIN PANEL
            </Typography>
          </Box>
        </Box>

        {/* Nav */}
        <Box sx={{ flex: 1, overflowY: 'auto', py: 2.5, px: 2 }}>
          {navGroups.map((group) => (
            <Box key={group.heading} sx={{ mb: 3.5 }}>
              <Typography
                sx={{
                  color: C.textMuted,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  px: 1.5,
                  mb: 1,
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {group.heading}
              </Typography>
              {group.items.map((item) => {
                const active = window.location.pathname === item.path;
                return (
                  <Box
                    key={item.path + item.label}
                    onClick={() => navigate(item.path)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 1.5,
                      py: 1,
                      borderRadius: '12px',
                      mb: 0.5,
                      cursor: 'pointer',
                      background: active ? C.accentSoft : 'transparent',
                      border: active ? `1px solid ${C.border}` : '1px solid transparent',
                      transition: 'all 0.18s ease',
                      '&:hover': { background: C.accentSoft, border: `1px solid ${C.border}` },
                    }}
                  >
                    <Typography
                      sx={{
                        color: active ? C.accent : C.textMuted,
                        fontSize: '13px',
                        lineHeight: 1,
                        transition: 'color 0.18s',
                      }}
                    >
                      {item.emoji}
                    </Typography>
                    <Typography
                      sx={{
                        color: active ? C.accent : C.textSecondary,
                        fontSize: '0.87rem',
                        fontWeight: active ? 700 : 500,
                        fontFamily: "'Syne', sans-serif",
                        transition: 'color 0.18s',
                        letterSpacing: '-0.1px',
                      }}
                    >
                      {item.label}
                    </Typography>
                    {active && (
                      <Box
                        sx={{
                          ml: 'auto',
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: C.accent,
                          boxShadow: `0 0 8px ${C.accent}`,
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>

        {/* Logout */}
        <Box sx={{ p: 2, borderTop: `1px solid ${C.border}` }}>
          <Box
            onClick={() => { localStorage.removeItem('adminToken'); navigate('/login'); }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1.5,
              py: 1.1,
              borderRadius: '12px',
              cursor: 'pointer',
              border: '1px solid transparent',
              transition: 'all 0.18s',
              '&:hover': { background: C.redDim, border: `1px solid ${C.red}33` },
            }}
          >
            <Typography sx={{ color: C.textMuted, fontSize: '13px' }}>⬡</Typography>
            <Typography sx={{ color: C.textSecondary, fontSize: '0.87rem', fontFamily: "'Syne', sans-serif" }}>
              Log Out
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ══ MAIN (Light Theme) ════════════════════════════════════════ */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Top bar (Light) */}
        <Box
          sx={{
            background: `${C.card}cc`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${C.border}`,
            px: 4,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '1.35rem',
                  color: C.textPrimary,
                  lineHeight: 1.15,
                  fontFamily: "'Syne', sans-serif",
                  letterSpacing: '-0.5px',
                }}
              >
                Dashboard
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.2 }}>
                <LiveDot />
                <Typography sx={{ color: C.textSecondary, fontSize: '0.75rem', fontFamily: "'DM Mono', monospace" }}>
                  Live · {new Date().toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TextField
              size="small"
              placeholder="Search users…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: C.textMuted, fontSize: 17 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ ...inputSx, width: 230 }}
            />
            <Box
              sx={{
                px: 2,
                py: 0.9,
                background: C.accentSoft,
                border: `1px solid ${C.border}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { border: `1px solid ${C.borderMid}`, background: 'rgba(46,125,50,0.1)' },
              }}
              onClick={() => fetchData()}
            >
              <Typography sx={{ fontSize: '0.78rem', color: C.accent, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>
                ↻ Refresh
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3.5 }, animation: 'fadeSlideUp 0.4s ease both' }}>

          {/* Error */}
          {error && (
            <Box
              sx={{
                p: 2,
                background: C.redDim,
                border: `1px solid ${C.red}33`,
                borderRadius: '14px',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Typography sx={{ fontSize: '15px', color: C.red }}>⚠</Typography>
              <Typography sx={{ color: C.red, fontSize: '0.88rem', fontFamily: "'Syne', sans-serif" }}>{error}</Typography>
            </Box>
          )}

          {/* ── KPI CARDS (Green Gradient) ── */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {[
              {
                label: 'Total Users',
                value: loading ? '—' : totalUsers,
                delta: '+12% this month',
                bg: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentDim} 100%)`,
                icon: '◈',
              },
              {
                label: 'Active Users',
                value: loading ? '—' : activeUsers,
                delta: '+8% this month',
                bg: `linear-gradient(135deg, ${C.accent} 0%, #1b5e20 100%)`,
                icon: '◎',
              },
              {
                label: 'Verified Accounts',
                value: loading ? '—' : verifiedUsers,
                delta: `${verificationRate}% verification rate`,
                bg: `linear-gradient(135deg, ${C.accentDim} 0%, #145214 100%)`,
                icon: '◆',
              },
            ].map((s, i) => (
              <Grid item xs={12} sm={6} lg={4} key={i}>
                <StatCard {...s} loading={loading} />
              </Grid>
            ))}
          </Grid>

          {/* ── CHARTS (Light Theme) ── */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>

            {/* Area chart */}
            <Grid item xs={12} md={7}>
              <Box sx={{ ...cardBase, p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: C.textPrimary,
                        fontFamily: "'Syne', sans-serif",
                        letterSpacing: '-0.2px',
                      }}
                    >
                      Weekly Registrations
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, mt: 0.3, fontFamily: "'DM Mono', monospace" }}>
                      New sign-ups per day of week
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.8,
                      px: 1.5,
                      py: 0.6,
                      background: C.accentSoft,
                      border: `1px solid ${C.border}`,
                      borderRadius: '8px',
                    }}
                  >
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: C.accent }} />
                    <Typography sx={{ fontSize: '0.7rem', color: C.accent, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
                      This week
                    </Typography>
                  </Box>
                </Box>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={weeklyReg} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.accent} stopOpacity={0.15} />
                        <stop offset="100%" stopColor={C.accent} stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: C.textSecondary, fontFamily: "'DM Mono', monospace" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: C.textSecondary, fontFamily: "'DM Mono', monospace" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartTooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="registrations"
                      stroke={C.accent}
                      strokeWidth={2}
                      fill="url(#regGrad)"
                      dot={{ r: 4, fill: C.card, stroke: C.accent, strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: C.accent, stroke: C.card, strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Grid>

            {/* Pie chart */}
            <Grid item xs={12} md={5}>
              <Box sx={{ ...cardBase, p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: C.textPrimary,
                      fontFamily: "'Syne', sans-serif",
                      letterSpacing: '-0.2px',
                    }}
                  >
                    User Breakdown
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: C.textSecondary, mt: 0.3, fontFamily: "'DM Mono', monospace" }}>
                    Distribution by account type
                  </Typography>
                </Box>

                {userTypePie.length === 0 ? (
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontSize: '0.9rem' }}>
                    No data yet
                  </Box>
                ) : (
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <ResponsiveContainer width={180} height={180}>
                        <PieChart>
                          <Pie
                            data={userTypePie}
                            cx="50%"
                            cy="50%"
                            innerRadius={52}
                            outerRadius={76}
                            paddingAngle={4}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {userTypePie.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} opacity={0.9} />
                            ))}
                          </Pie>
                          <RechartTooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center label */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%,-50%)',
                          textAlign: 'center',
                          pointerEvents: 'none',
                        }}
                      >
                        <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: C.textPrimary, fontFamily: "'Syne', sans-serif", lineHeight: 1, letterSpacing: '-1px' }}>
                          {verificationRate}%
                        </Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: C.textSecondary, fontFamily: "'DM Mono', monospace" }}>
                          verified
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mt: 2 }}>
                      {userTypePie.map((d) => (
                        <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '2px', background: d.color, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: '0.76rem', color: C.textSecondary, fontFamily: "'DM Mono', monospace" }}>
                            {d.name}
                          </Typography>
                          <Typography sx={{ fontSize: '0.76rem', color: C.textPrimary, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                            {d.value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* ── MATERIALS ANALYTICS ── */}
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                color: C.textMuted,
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                mb: 2,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              Materials Analytics
            </Typography>


            {/* Leaderboard + Insights */}
            <Grid container spacing={2.5}>

              {/* Leaderboard */}
              <Grid item xs={12} md={7}>
                <Box sx={{ ...cardBase, p: 0 }}>
                  <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${C.border}`, background: C.cardElevated }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: C.textPrimary, fontFamily: "'Syne', sans-serif" }}>
                      Material Leaderboard
                    </Typography>
                    <Typography sx={{ fontSize: '0.74rem', color: C.textSecondary, fontFamily: "'DM Mono', monospace", mt: 0.3 }}>
                      Ranked by volume collected this month
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table sx={{ '& .MuiTableCell-root': { borderColor: C.border, py: 1.6, px: 2.5 } }}>
                      <TableHead>
                        <TableRow>
                          {['#', 'Material', 'Volume', 'Share'].map((h) => (
                            <TableCell
                              key={h}
                              sx={{
                                color: C.textMuted,
                                fontWeight: 700,
                                fontSize: '0.65rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px',
                                background: C.cardElevated,
                                fontFamily: "'DM Mono', monospace",
                              }}
                            >
                              {h}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[
                          { rank: 1, label: 'Plastic', color: C.blue, bg: C.blueDim, value: totalPlastic, pct: 35, icon: '🧴' },
                          { rank: 2, label: 'Metal', color: '#475569', bg: 'rgba(71,85,105,0.08)', value: totalMetal, pct: 24, icon: '🔩' },
                          { rank: 3, label: 'Bronze', color: C.amber, bg: C.amberDim, value: totalBronze, pct: 8, icon: '🏺' },
                        ].map((row) => (
                          <TableRow
                            key={row.label}
                            sx={{ '&:hover': { background: C.accentSoft }, transition: 'background 0.15s' }}
                          >
                            <TableCell>
                              <Box
                                sx={{
                                  width: 24, height: 24, borderRadius: '7px',
                                  background: row.rank === 1 ? '#fef9c3' : C.cardElevated,
                                  color: row.rank === 1 ? '#a16207' : C.textMuted,
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '0.7rem', fontWeight: 800, fontFamily: "'DM Mono', monospace",
                                }}
                              >
                                {row.rank}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: 'inline-flex', alignItems: 'center', gap: 0.8,
                                  px: 1.2, py: 0.4, borderRadius: '8px',
                                  background: row.bg, color: row.color,
                                  border: `1px solid ${row.color}33`,
                                  fontSize: '0.76rem', fontWeight: 700, fontFamily: "'Syne', sans-serif",
                                }}
                              >
                                <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: row.color }} />
                                {row.label}
                              </Box>
                            </TableCell>
                            <TableCell
                              sx={{
                                fontFamily: "'DM Mono', monospace",
                                fontWeight: 700,
                                color: C.textPrimary,
                                fontSize: '0.83rem',
                              }}
                            >
                              {loading ? '—' : `${row.value.toLocaleString()} kg`}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    flex: 1,
                                    height: 6,
                                    borderRadius: '99px',
                                    background: 'rgba(0,0,0,0.05)',
                                    overflow: 'hidden',
                                    minWidth: 60,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      height: '100%',
                                      width: `${row.pct}%`,
                                      background: row.color,
                                      borderRadius: '99px',
                                    }}
                                  />
                                </Box>
                                <Typography
                                  sx={{
                                    fontSize: '0.72rem',
                                    color: C.textSecondary,
                                    fontFamily: "'DM Mono', monospace",
                                    minWidth: 28,
                                  }}
                                >
                                  {row.pct}%
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Grid>

              {/* Insights */}
              <Grid item xs={12} md={5}>
                <Box sx={{ ...cardBase, p: 0, height: '100%' }}>
                  <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${C.border}`, background: C.cardElevated }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: C.textPrimary, fontFamily: "'Syne', sans-serif" }}>
                      Collection Insights
                    </Typography>
                    <Typography sx={{ fontSize: '0.74rem', color: C.textSecondary, fontFamily: "'DM Mono', monospace", mt: 0.3 }}>
                      Key metrics at a glance
                    </Typography>
                  </Box>
                  <Box sx={{ px: 3 }}>
                    {[
                      {
                        icon: '♻️', bg: C.accentSoft,
                        label: 'Total Collected', sub: 'All materials, all time',
                        value: `${totalCollectedAll.toLocaleString()} kg`,
                        change: '▲ +11% vs last month', up: true,
                      },
                      {
                        icon: '🏆', bg: C.blueDim,
                        label: 'Top Material', sub: 'By volume collected',
                        value: 'Plastic', valueColor: C.blue,
                        change: '35% of total', up: null,
                      },
                      {
                        icon: '🌍', bg: C.accentSoft,
                        label: 'CO₂ Offset Est.', sub: 'Based on collection data',
                        value: '9.2 t', valueColor: C.accent,
                        change: 'tonnes this month', up: null,
                      },
                    ].map((ins, i) => (
                      <Box
                        key={i}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 1.5,
                          py: 1.8,
                          borderBottom: i < 4 ? `1px solid ${C.border}` : 'none',
                        }}
                      >
                        <Box
                          sx={{
                            width: 36, height: 36, borderRadius: '10px',
                            background: ins.bg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '16px', flexShrink: 0,
                          }}
                        >
                          {ins.icon}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: C.textPrimary, fontFamily: "'Syne', sans-serif" }}>
                            {ins.label}
                          </Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: C.textSecondary, fontFamily: "'DM Mono', monospace", mt: 0.2 }}>
                            {ins.sub}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                          <Typography
                            sx={{
                              fontSize: '0.95rem', fontWeight: 800,
                              color: ins.valueColor || C.textPrimary,
                              fontFamily: "'Syne', sans-serif",
                              letterSpacing: '-0.3px',
                            }}
                          >
                            {loading ? '—' : ins.value}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.7rem', fontFamily: "'DM Mono', monospace", mt: 0.3,
                              color: ins.up === true ? C.accent : ins.up === false ? '#ea580c' : C.textMuted,
                            }}
                          >
                            {ins.change}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* ── USERS TABLE (White Card) ── */}
          <Box sx={{ ...cardBase, p: 0 }}>

            {/* Table header */}
            <Box
              sx={{
                px: 3,
                py: 2.5,
                borderBottom: `1px solid ${C.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
                background: C.cardElevated,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: C.textPrimary,
                    fontFamily: "'Syne', sans-serif",
                    letterSpacing: '-0.2px',
                  }}
                >
                  Registered Users
                </Typography>
                <Typography sx={{ fontSize: '0.74rem', color: C.textSecondary, mt: 0.2, fontFamily: "'DM Mono', monospace" }}>
                  Manage and monitor all accounts
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  select
                  size="small"
                  label="Type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  sx={{ ...inputSx, minWidth: 125 }}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          background: C.card,
                          border: `1px solid ${C.border}`,
                          borderRadius: '12px',
                          '& .MuiMenuItem-root': {
                            color: C.textSecondary,
                            fontFamily: "'Syne', sans-serif",
                            fontSize: '0.84rem',
                            '&:hover': { background: C.accentSoft, color: C.accent },
                            '&.Mui-selected': { background: C.accentSoft, color: C.accent },
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="business">Business</MenuItem>
                  <MenuItem value="recycler">Recycler</MenuItem>
                  <MenuItem value="artist">Artist</MenuItem>
                </TextField>

                <TextField
                  select
                  size="small"
                  label="Status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  sx={{ ...inputSx, minWidth: 125 }}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          background: C.card,
                          border: `1px solid ${C.border}`,
                          borderRadius: '12px',
                          '& .MuiMenuItem-root': {
                            color: C.textSecondary,
                            fontFamily: "'Syne', sans-serif",
                            fontSize: '0.84rem',
                            '&:hover': { background: C.accentSoft, color: C.accent },
                            '&.Mui-selected': { background: C.accentSoft, color: C.accent },
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="verified">Verified</MenuItem>
                  <MenuItem value="unverified">Unverified</MenuItem>
                </TextField>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={32} sx={{ color: C.accent }} />
                  <Typography sx={{ color: C.textMuted, fontSize: '0.78rem', mt: 2, fontFamily: "'DM Mono', monospace" }}>
                    Loading users…
                  </Typography>
                </Box>
              </Box>
            ) : filteredUsers.length === 0 ? (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '2rem', mb: 1, color: C.textMuted }}>◌</Typography>
                <Typography sx={{ color: C.textMuted, fontSize: '0.88rem', fontFamily: "'Syne', sans-serif" }}>No users found</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table
                  sx={{
                    '& .MuiTableCell-root': {
                      borderColor: C.border,
                      py: 1.8,
                      px: 2.5,
                    },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      {['Name', 'Email', 'Type', 'Status', 'Verified', 'Joined', 'Actions'].map((h) => (
                        <TableCell
                          key={h}
                          sx={{
                            color: C.textMuted,
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1.5px',
                            background: C.cardElevated,
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user, rowIdx) => (
                      <TableRow
                        key={user.id}
                        sx={{
                          '&:hover': {
                            background: C.accentSoft,
                            '& .row-actions': { opacity: 1 },
                          },
                          transition: 'background 0.15s',
                          animation: `fadeSlideUp 0.35s ease ${rowIdx * 0.03}s both`,
                        }}
                      >
                        {/* Name */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 34,
                                height: 34,
                                borderRadius: '10px',
                                background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentDim} 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: '0.82rem',
                                flexShrink: 0,
                                fontFamily: "'Syne', sans-serif",
                              }}
                            >
                              {(user.name || 'U')[0].toUpperCase()}
                            </Box>
                            <Typography
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.87rem',
                                color: C.textPrimary,
                                fontFamily: "'Syne', sans-serif",
                                letterSpacing: '-0.1px',
                              }}
                            >
                              {user.name || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Email */}
                        <TableCell
                          sx={{ color: C.textSecondary, fontSize: '0.82rem', fontFamily: "'DM Mono', monospace" }}
                        >
                          {user.email}
                        </TableCell>

                        {/* Type */}
                        <TableCell>
                          {(() => {
                            const cfg =
                              user.type === 'business'
                                ? { color: C.blue, bg: C.blueDim, label: 'Business' }
                                : user.type === 'recycler'
                                  ? { color: C.accent, bg: C.accentSoft, label: 'Recycler' }
                                  : { color: C.amber, bg: C.amberDim, label: 'Artist' };
                            return (
                              <Box
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  px: 1.4,
                                  py: 0.45,
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  fontFamily: "'Syne', sans-serif",
                                  background: cfg.bg,
                                  color: cfg.color,
                                  border: `1px solid ${cfg.color}33`,
                                  letterSpacing: '0.2px',
                                }}
                              >
                                {cfg.label}
                              </Box>
                            );
                          })()}
                        </TableCell>

                        {/* Active */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Box
                              sx={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: user.isActive ? C.accent : C.red,
                                boxShadow: user.isActive ? `0 0 6px ${C.accent}` : 'none',
                                animation: user.isActive ? 'pulse-ring 2.5s ease-out infinite' : 'none',
                              }}
                            />
                            <Typography
                              sx={{
                                fontSize: '0.8rem',
                                color: user.isActive ? C.accent : C.red,
                                fontWeight: 600,
                                fontFamily: "'Syne', sans-serif",
                              }}
                            >
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Verified */}
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              px: 1.3,
                              py: 0.4,
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              fontFamily: "'Syne', sans-serif",
                              background: user.isVerified ? C.accentSoft : C.amberDim,
                              color: user.isVerified ? C.accent : C.amber,
                              border: `1px solid ${user.isVerified ? C.accent + '33' : C.amber + '33'}`,
                            }}
                          >
                            {user.isVerified ? '✓ Verified' : '⏳ Pending'}
                          </Box>
                        </TableCell>

                        {/* Joined */}
                        <TableCell
                          sx={{
                            color: C.textMuted,
                            fontSize: '0.78rem',
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {format(new Date(user.createdAt), 'MMM d, yyyy')}
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <Box className="row-actions" sx={{ display: 'flex', gap: 0.8 }}>
                            {[
                              {
                                label: 'View',
                                color: C.blue,
                                border: `${C.blue}44`,
                                bg: C.blueDim,
                                onClick: () => handleViewDetails(user.id),
                              },
                              {
                                label: user.isVerified ? 'Unverify' : 'Verify',
                                color: C.accent,
                                border: `${C.accent}44`,
                                bg: C.accentSoft,
                                onClick: () => handleVerifyUser(user.id, user.isVerified),
                              },
                              {
                                label: 'Delete',
                                color: C.red,
                                border: `${C.red}44`,
                                bg: C.redDim,
                                onClick: () => handleDeleteUser(user.id),
                              },
                            ].map((btn) => (
                              <Box
                                key={btn.label}
                                onClick={btn.onClick}
                                sx={{
                                  px: 1.4,
                                  py: 0.5,
                                  borderRadius: '8px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  fontFamily: "'Syne', sans-serif",
                                  color: btn.color,
                                  border: `1px solid ${btn.border}`,
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s',
                                  userSelect: 'none',
                                  '&:hover': {
                                    background: btn.bg,
                                    borderColor: btn.color,
                                  },
                                }}
                              >
                                {btn.label}
                              </Box>
                            ))}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Footer */}
            <Box
              sx={{
                px: 3,
                py: 1.8,
                borderTop: `1px solid ${C.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: C.cardElevated,
              }}
            >
              <Typography sx={{ fontSize: '0.76rem', color: C.textMuted, fontFamily: "'DM Mono', monospace" }}>
                Showing{' '}
                <span style={{ color: C.textPrimary, fontWeight: 700 }}>{filteredUsers.length}</span>
                {' '}of{' '}
                <span style={{ color: C.textPrimary, fontWeight: 700 }}>{users.length}</span>
                {' '}users
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <LiveDot />
                <Typography sx={{ fontSize: '0.73rem', color: C.textMuted, fontFamily: "'DM Mono', monospace" }}>
                  Updated {new Date().toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Bottom padding */}
          <Box sx={{ height: 32 }} />
        </Box>
      </Box>
    </Box>
  );
};

function LineProgress({ value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          flex: 1,
          backgroundColor: 'rgba(46,125,50,0.08)',
          borderRadius: '99px',
          height: 4,
          '& .MuiLinearProgress-bar': {
            backgroundColor: C.accent,
            borderRadius: '99px',
          },
        }}
      />
      <Typography
        variant="caption"
        sx={{ minWidth: 40, color: C.textSecondary, fontFamily: "'DM Mono', monospace", fontSize: '0.72rem' }}
      >
        {value}%
      </Typography>
    </Box>
  );
}

export default AdminDashboard;