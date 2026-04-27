import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/* ─── Color tokens – 70% White + 30% Green ─────────────────────────
   primary    : #2E7D32 (Forest Green – CTA, accents, interactive)
   primaryDark: #1B5E20 (darker green for hover states)
   bg         : #FFFFFF (clean white – main background)
   surface    : #FFFFFF (pure white for cards)
   surfaceHigh: #F9FAFB (subtle off-white for elevated surfaces)
   text       : #1F2937 (dark slate for readability)
   textLight  : #4B5563 (muted gray for secondary text)
   textLighter: #9CA3AF (very muted gray)
   border     : #E5E7EB (light gray borders)
   borderHover: #2E7D32 (green hover border)
─────────────────────────────────────────────────────────────────────── */
const C = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  primaryLight: '#4CAF50',
  bg: '#FFFFFF',
  bgDeep: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceHigh: '#F9FAFB',
  cardHover: '#F1F5F9',
  text: '#1F2937',
  textLight: '#4B5563',
  textLighter: '#9CA3AF',
  border: '#E5E7EB',
  borderHover: '#2E7D32',
  glowLight: 'rgba(46,125,50,0.08)',
  glowStrong: 'rgba(46,125,50,0.2)',
};

/* ─── Inline keyframe style injection ─── */
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #FFFFFF; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes floatA {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-18px) rotate(3deg); }
  }
  @keyframes floatB {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-12px) rotate(-2deg); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes pulseRing {
    0%   { transform: scale(0.9); opacity: 1; }
    70%  { transform: scale(1.4); opacity: 0; }
    100% { transform: scale(0.9); opacity: 0; }
  }
  @keyframes rotateSlow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes counterUp {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }
  @keyframes lineGrow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50%       { background-position: 100% 50%; }
  }
  @keyframes scanLine {
    0%   { top: 0; opacity: 0.5; }
    100% { top: 100%; opacity: 0; }
  }

  .hero-title-word {
    display: inline-block;
    animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .hero-title-word:nth-child(1) { animation-delay: 0.1s; }
  .hero-title-word:nth-child(2) { animation-delay: 0.2s; }
  .hero-title-word:nth-child(3) { animation-delay: 0.3s; }

  .stat-card:hover .stat-number { color: #2E7D32; }

  .feature-card {
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
  }
  .feature-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(46,125,50,0.05) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.35s ease;
  }
  .feature-card:hover::before { opacity: 1; }
  .feature-card:hover {
    transform: translateY(-6px);
    border-color: rgba(46,125,50,0.5) !important;
    box-shadow: 0 20px 50px rgba(0,0,0,0.08), 0 0 0 1px rgba(46,125,50,0.1) !important;
  }

  .role-card {
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
  }
  .role-card::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #2E7D32, transparent);
    transform: scaleX(0);
    transition: transform 0.4s ease;
  }
  .role-card:hover::after { transform: scaleX(1); }
  .role-card:hover {
    transform: translateY(-8px);
    background: #F9FAFB !important;
    box-shadow: 0 30px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(46,125,50,0.2) !important;
  }

  .step-card {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .step-card:hover {
    transform: translateY(-6px) scale(1.01);
    border-color: rgba(46,125,50,0.4) !important;
    box-shadow: 0 24px 48px rgba(0,0,0,0.08) !important;
  }

  .testimonial-card {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
  }
  .testimonial-card:hover {
    transform: translateY(-6px);
    border-color: rgba(46,125,50,0.35) !important;
    box-shadow: 0 20px 48px rgba(0,0,0,0.08) !important;
  }

  .cta-btn {
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .cta-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .cta-btn:hover::after { opacity: 1; }
  .cta-btn:hover {
    transform: translateY(-3px) scale(1.02) !important;
    box-shadow: 0 16px 40px rgba(46,125,50,0.35), 0 4px 12px rgba(0,0,0,0.1) !important;
  }
  .cta-btn:active { transform: translateY(-1px) scale(1.00) !important; }

  .nav-link {
    position: relative;
    font-size: 13px;
    font-family: 'Outfit', sans-serif;
    font-weight: 500;
    color: #4B5563;
    cursor: pointer;
    transition: color 0.2s;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -2px; left: 0; right: 0;
    height: 1px;
    background: #2E7D32;
    transform: scaleX(0);
    transition: transform 0.25s ease;
  }
  .nav-link:hover { color: #2E7D32; }
  .nav-link:hover::after { transform: scaleX(1); }

  .gold-shimmer {
    background: linear-gradient(90deg, #2E7D32 0%, #4CAF50 40%, #2E7D32 60%, #1B5E20 100%);
    background-size: 800px 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }

  .bar-fill {
    transition: height 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #F1F5F9; }
  ::-webkit-scrollbar-thumb { background: rgba(46,125,50,0.3); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(46,125,50,0.6); }
`;

/* ─── Ambient orb background (green tint) ─── */
function AmbientOrbs() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {/* Large deep orb top-right */}
      <div style={{
        position: 'absolute', top: '-15%', right: '-10%',
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(46,125,50,0.06) 0%, transparent 65%)',
        animation: 'floatA 14s ease-in-out infinite',
      }} />
      {/* Mid orb bottom-left */}
      <div style={{
        position: 'absolute', bottom: '10%', left: '-8%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(46,125,50,0.04) 0%, transparent 65%)',
        animation: 'floatB 18s ease-in-out infinite',
      }} />
      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(46,125,50,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(46,125,50,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px',
      }} />
      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(248,250,252,0.6) 100%)',
      }} />
    </div>
  );
}

/* ─── Logo Mark (green gradient) ─── */
function LogoMark({ size = 40 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.28,
      background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 4px 16px rgba(46,125,50,0.3), inset 0 1px 0 rgba(255,255,255,0.2)`,
      flexShrink: 0,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Shine */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)',
        borderRadius: `${size * 0.28}px ${size * 0.28}px 0 0`,
      }} />
      <svg width={size * 0.48} height={size * 0.48} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8L12 3L20 8L12 13L4 8Z" />
        <path d="M4 14L12 19L20 14" />
        <path d="M4 11L12 16L20 11" />
      </svg>
    </div>
  );
}

/* ─── Section reveal hook ─── */
function useReveal() {
  const [visible, setVisible] = useState(new Set());
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && setVisible(p => new Set([...p, e.target.dataset.s]))),
      { threshold: 0.12 }
    );
    document.querySelectorAll('[data-s]').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
  const reveal = (k, delay = 0) => ({
    opacity: visible.has(k) ? 1 : 0,
    transform: visible.has(k) ? 'translateY(0)' : 'translateY(36px)',
    transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  });
  return { visible, reveal };
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const { visible, reveal } = useReveal();
  const [barsVisible, setBarsVisible] = useState(false);
  const barsRef = useRef(null);

  useEffect(() => {
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', sc, { passive: true });
    return () => window.removeEventListener('scroll', sc);
  }, []);

  useEffect(() => {
    if (!barsRef.current) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setBarsVisible(true); }, { threshold: 0.3 });
    io.observe(barsRef.current);
    return () => io.disconnect();
  }, []);

  const go = () => isAuthenticated
    ? navigate(user?.type === 'business' ? '/business/dashboard' : '/recycler/dashboard')
    : navigate('/role-selection');

  const stats = [
    { v: '2.4K+', l: 'Waste Reports' },
    { v: '4.6K+', l: 'Active Users' },
    { v: '300+', l: 'Recycling Transactions' },
    { v: '12+', l: 'Cities Covered' },
  ];

  const features = [
    { icon: '♻️', title: 'Smart Waste Reporting', desc: 'Report waste in seconds with AI-powered categorization. Specify type, quantity, and location.', tag: 'Core' },
    { icon: '🚛', title: 'Role-based Matching', desc: 'Intelligent pairing between Needy, Guardian, and Hero recyclers based on proximity.', tag: 'AI' },
    { icon: '📍', title: 'Live Collection Tracking', desc: 'Real-time visibility from request to processing. Track your waste\'s journey.', tag: 'Real-time' },
    { icon: '📊', title: 'Research Analytics', desc: 'Dashboards for sustainability metrics, carbon offset, and community impact studies.', tag: 'Insights' },
  ];

  const testimonials = [
    { name: 'Sarah Johnson', role: 'Guardian', co: 'Mabolo', text: 'Scrapair streamlined our entire waste management workflow. The analytics dashboard saved us 30% in operational costs.' },
    { name: 'Michael Chen', role: 'Hero Recycler', co: 'Cebu City', text: 'The matching algorithm is incredibly accurate. We\'ve doubled our collection efficiency since joining.' },
    { name: 'Priya Nair', role: 'Needy User', co: 'Pardo', text: 'Scheduling pickups is effortless. Live tracking gives me peace of mind that my waste is handled responsibly.' },
  ];

  const roles = [
    { name: 'Needy', icon: '🏠', description: 'Request waste pickup, schedule collections, and track your environmental impact.', num: '01' },
    { name: 'Guardian', icon: '🛡️', description: 'Monitor community waste metrics, verify collections, and manage sustainability goals.', num: '02' },
    { name: 'Hero', icon: '⚡', description: 'Collect, process, and recycle waste. Earn rewards while saving the planet.', num: '03' },
  ];

  const howItWorks = [
    { step: '01', title: 'Report Waste', desc: 'Submit waste details with photos, quantity, and preferred pickup window.' },
    { step: '02', title: 'Smart Match', desc: 'Guardians verify request; Heroes are matched based on proximity and capacity.' },
    { step: '03', title: 'Collect & Track', desc: 'Real-time tracking from pickup to recycling facility with instant notifications.' },
    { step: '04', title: 'Impact Report', desc: 'View carbon offset, recycling certificates, and community contribution stats.' },
  ];

  const barHeights = [40, 58, 34, 70, 55, 82, 90, 65, 76, 85, 93, 100];

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      fontFamily: "'Outfit', system-ui, sans-serif",
      overflowX: 'hidden',
      color: C.text,
      position: 'relative',
    }}>
      <style>{KEYFRAMES}</style>
      <AmbientOrbs />

      {/* ══════════ NAVBAR ══════════ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrollY > 30
          ? 'rgba(255,255,255,0.92)'
          : 'transparent',
        backdropFilter: scrollY > 30 ? 'blur(24px) saturate(1.5)' : 'none',
        borderBottom: scrollY > 30 ? `1px solid ${C.border}` : '1px solid transparent',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LogoMark size={38} />
            <div>
              <span style={{
                fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px',
                fontFamily: "'Cormorant Garamond', serif",
                color: C.text,
              }}>scrapair</span>
              <div style={{ height: 1.5, background: `linear-gradient(90deg, ${C.primary}, transparent)`, marginTop: 1, width: '100%' }} />
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={go}
            className="cta-btn"
            style={{
              padding: '10px 26px',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              borderRadius: 4,
              border: `1px solid ${C.primary}`,
              background: 'transparent',
              color: C.primary,
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
            }}
          >{isAuthenticated ? 'Dashboard' : 'Get Started'}</button>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section style={{
        minHeight: '95vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        position: 'relative', zIndex: 2,
        maxWidth: 1320, margin: '0 auto', padding: '80px 40px 60px',
      }}>
        {/* Live badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          border: `1px solid ${C.border}`,
          borderRadius: 2,
          padding: '6px 18px 6px 14px',
          marginBottom: 56,
          width: 'fit-content',
          background: 'rgba(46,125,50,0.04)',
          animation: 'fadeIn 0.6s ease both',
        }}>
          {/* Pulse dot */}
          <div style={{ position: 'relative', width: 8, height: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.primary, position: 'absolute' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.primary, position: 'absolute', animation: 'pulseRing 2s ease-out infinite' }} />
          </div>
          <span style={{ fontSize: 12, color: C.textLight, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Now serving Cebu City Metro
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 80, alignItems: 'center' }}>
          {/* Left */}
          <div>
            {/* Eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, animation: 'fadeUp 0.7s ease 0.05s both' }}>
              <div style={{ width: 32, height: 1, background: C.primary }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.primary }}>
                Circular Economy Platform
              </span>
            </div>

            {/* Main heading */}
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 80,
              fontWeight: 600,
              lineHeight: 1.0,
              letterSpacing: '-2px',
              margin: '0 0 28px',
              color: C.text,
            }}>
              <span className="hero-title-word" style={{ display: 'block' }}>Transform</span>
              <span className="hero-title-word" style={{ display: 'block' }}>Waste into</span>
              <span className="hero-title-word" style={{ display: 'block' }}>
                <span className="gold-shimmer">Opportunity.</span>
              </span>
            </h1>

            <p style={{
              fontSize: 17, lineHeight: 1.75, color: C.textLight,
              maxWidth: 460, margin: '0 0 48px',
              animation: 'fadeUp 0.7s ease 0.4s both',
            }}>
              A smart digital platform connecting communities, recyclers, and businesses for efficient waste management across Cebu.
            </p>

            {/* CTA group */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', animation: 'fadeUp 0.7s ease 0.5s both' }}>
              <button
                onClick={go}
                className="cta-btn"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '16px 40px',
                  fontSize: 14, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                  borderRadius: 4, border: 'none',
                  background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`,
                  color: 'white',
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  boxShadow: '0 4px 20px rgba(46,125,50,0.25)',
                }}
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Report Waste'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              <button
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '16px 32px',
                  fontSize: 14, fontWeight: 500, letterSpacing: '0.04em',
                  borderRadius: 4,
                  border: `1px solid ${C.border}`,
                  background: 'transparent',
                  color: C.text,
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text; }}
              >
                Learn More
              </button>
            </div>

            {/* Social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 48, animation: 'fadeUp 0.7s ease 0.65s both' }}>
              <div style={{ display: 'flex' }}>
                {['SJ', 'MC', 'PN', 'AR', 'LT'].map((init, i) => (
                  <div key={i} style={{
                    width: 34, height: 34, borderRadius: '50%',
                    border: `2px solid ${C.bg}`,
                    background: i % 2 === 0 ? C.surfaceHigh : 'rgba(46,125,50,0.15)',
                    marginLeft: i ? -10 : 0, zIndex: 5 - i,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 600, color: C.primary,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}>
                    {init}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ color: C.primary, fontSize: 11, letterSpacing: 2 }}>★★★★★</div>
                <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Trusted by 4,600+ active users</div>
              </div>
              <div style={{ width: 1, height: 32, background: C.border }} />
              <div style={{ fontSize: 12, color: C.textLight }}>
                <span style={{ color: C.primary, fontWeight: 600 }}>142.8 t</span> recycled this month
              </div>
            </div>
          </div>

          {/* Right — Metrics Card */}
          <div ref={barsRef} style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            padding: 36,
            boxShadow: '0 40px 80px rgba(0,0,0,0.08)',
            position: 'relative',
            overflow: 'hidden',
            animation: 'fadeUp 0.8s ease 0.3s both',
          }}>
            {/* Corner accent */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `linear-gradient(225deg, rgba(46,125,50,0.08) 0%, transparent 60%)` }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: 1, height: 80, background: `linear-gradient(180deg, ${C.primary} 0%, transparent 100%)`, opacity: 0.5 }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 1, background: `linear-gradient(270deg, ${C.primary} 0%, transparent 100%)`, opacity: 0.5 }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 10, color: C.textLighter, marginBottom: 8, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500 }}>
                  Waste Recycled · This Month
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 52, fontWeight: 600, letterSpacing: '-1px', color: C.text, lineHeight: 1,
                  }}>142.8</span>
                  <span style={{ fontSize: 16, fontWeight: 500, color: C.primary }}>tons</span>
                </div>
              </div>
              <div style={{
                background: 'rgba(46,125,50,0.08)',
                border: `1px solid rgba(46,125,50,0.2)`,
                borderRadius: 2,
                padding: '6px 14px',
              }}>
                <span style={{ fontSize: 13, color: C.primary, fontWeight: 600 }}>↑ 18.4%</span>
              </div>
            </div>

            {/* Bars */}
            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: 5,
              height: 72, marginBottom: 28,
              padding: '0 0 0',
              borderBottom: `1px solid ${C.border}`,
              paddingBottom: 12,
            }}>
              {barHeights.map((h, i) => (
                <div
                  key={i}
                  className="bar-fill"
                  style={{
                    flex: 1,
                    background: i === 11
                      ? `linear-gradient(180deg, ${C.primary} 0%, ${C.primaryDark} 100%)`
                      : i >= 9
                        ? 'rgba(46,125,50,0.3)'
                        : 'rgba(46,125,50,0.12)',
                    height: barsVisible ? `${h}%` : '0%',
                    borderRadius: '2px 2px 0 0',
                    transitionDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>

            {/* Mini stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { l: 'Active Reports', v: '24', icon: '📋' },
                { l: 'Heroes Available', v: '12', icon: '⚡' },
                { l: 'Pickups Today', v: '18', icon: '🚛' },
                { l: 'CO₂ Offset', v: '8.2t', icon: '🌿' },
              ].map((s, i) => (
                <div key={i} style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 4, padding: '14px 16px',
                  background: C.surfaceHigh,
                  transition: 'all 0.25s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.background = C.cardHover; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surfaceHigh; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 13 }}>{s.icon}</span>
                    <div style={{ fontSize: 9, color: C.textLighter, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>{s.l}</div>
                  </div>
                  <div style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 28, fontWeight: 600, color: C.text, letterSpacing: '-0.5px',
                  }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats band */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
          marginTop: 80,
          border: `1px solid ${C.border}`,
          borderRadius: 4,
          overflow: 'hidden',
          background: C.surface,
          animation: 'fadeUp 0.8s ease 0.7s both',
        }}>
          {stats.map((s, i) => (
            <div key={i} className="stat-card" style={{
              padding: '28px 32px',
              borderRight: i < 3 ? `1px solid ${C.border}` : 'none',
              textAlign: 'center',
              transition: 'background 0.25s',
              cursor: 'default',
            }}
              onMouseEnter={e => e.currentTarget.style.background = C.surfaceHigh}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div className="stat-number" style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 40, fontWeight: 600, letterSpacing: '-1.5px', color: C.text, lineHeight: 1,
                transition: 'color 0.25s',
              }}>{s.v}</div>
              <div style={{ fontSize: 12, color: C.textLight, marginTop: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ ROLE SECTION ══════════ */}
      <section data-s="roles" style={{ maxWidth: 1320, margin: '0 auto', padding: '60px 40px 100px' }}>
        <div style={{ ...reveal('roles') }}>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 72, flexWrap: 'wrap', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 1, background: C.primary }} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.primary }}>Our Ecosystem</span>
              </div>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 56, fontWeight: 600, letterSpacing: '-1.5px', color: C.text, margin: 0, lineHeight: 1.1,
              }}>Three Roles,<br />One Mission.</h2>
            </div>
            <p style={{ fontSize: 15, color: C.textLight, maxWidth: 300, lineHeight: 1.7, textAlign: 'right' }}>
              Designed for every stakeholder in the circular economy
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {roles.map((role, i) => (
              <div key={i} className="role-card" style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                padding: '40px 32px 36px',
                cursor: 'pointer',
              }}>
                {/* Number + icon row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 72, fontWeight: 300,
                    color: 'rgba(46,125,50,0.12)',
                    lineHeight: 1, letterSpacing: '-3px',
                  }}>{role.num}</span>
                  <div style={{
                    width: 52, height: 52,
                    borderRadius: 4,
                    border: `1px solid ${C.border}`,
                    background: C.surfaceHigh,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26,
                  }}>{role.icon}</div>
                </div>
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 30, fontWeight: 600, color: C.primary,
                  marginBottom: 12, letterSpacing: '-0.5px',
                }}>{role.name}</h3>
                <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: 0 }}>{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section data-s="how" style={{ maxWidth: 1320, margin: '0 auto', padding: '60px 40px 100px' }}>
        <div style={{ ...reveal('how') }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 1, background: C.primary }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.primary }}>How It Works</span>
              <div style={{ width: 40, height: 1, background: C.primary }} />
            </div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 56, fontWeight: 600, letterSpacing: '-1.5px', color: C.text, margin: 0,
            }}>From Waste to Impact.</h2>
          </div>

          {/* Steps with connector line */}
          <div style={{ position: 'relative' }}>
            {/* Connector */}
            <div style={{
              position: 'absolute',
              top: 32, left: '12.5%', right: '12.5%',
              height: 1,
              background: `linear-gradient(90deg, transparent, ${C.border}, ${C.border}, ${C.border}, transparent)`,
              zIndex: 0,
            }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, position: 'relative', zIndex: 1 }}>
              {howItWorks.map((step, i) => (
                <div key={i} className="step-card" style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  padding: '32px 24px 28px',
                }}>
                  {/* Step number circle */}
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    border: `1px solid ${C.border}`,
                    background: C.surfaceHigh,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 24,
                    position: 'relative',
                  }}>
                    <span style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 18, fontWeight: 600, color: C.primary,
                    }}>{step.step}</span>
                    {/* Ring accent */}
                    {i === 0 && <div style={{
                      position: 'absolute', inset: -4,
                      borderRadius: '50%',
                      border: `1px solid rgba(46,125,50,0.3)`,
                    }} />}
                  </div>
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 22, fontWeight: 600, color: C.text,
                    marginBottom: 12, letterSpacing: '-0.3px',
                  }}>{step.title}</h3>
                  <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section data-s="feat" style={{ maxWidth: 1320, margin: '0 auto', padding: '60px 40px 100px' }}>
        <div style={{ ...reveal('feat') }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 80, alignItems: 'start' }}>
            {/* Left sticky label */}
            <div style={{ position: 'sticky', top: 120 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 1, background: C.primary }} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.primary }}>Capabilities</span>
              </div>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 52, fontWeight: 600, letterSpacing: '-1.5px', color: C.text, margin: '0 0 20px', lineHeight: 1.1,
              }}>Built for<br />Circular<br />Economy.</h2>
              <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.75 }}>
                Every feature designed to close the loop between waste generation and responsible recycling.
              </p>
            </div>

            {/* Right features grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {features.map((item, i) => (
                <div key={i} className="feature-card" style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  padding: '28px 24px',
                }}>
                  <div style={{
                    width: 48, height: 48,
                    borderRadius: 4,
                    border: `1px solid ${C.border}`,
                    background: C.surfaceHigh,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, marginBottom: 20,
                  }}>{item.icon}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <h4 style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 20, fontWeight: 600, color: C.text, margin: 0,
                    }}>{item.title}</h4>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700, color: C.primary,
                      background: 'rgba(46,125,50,0.08)',
                      border: `1px solid rgba(46,125,50,0.2)`,
                      borderRadius: 2,
                      padding: '2px 10px',
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>{item.tag}</span>
                  </div>
                  <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section data-s="test" style={{
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        background: C.bgDeep,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Ambient lines */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(90deg, ${C.border} 1px, transparent 1px)`, backgroundSize: '200px 100%', opacity: 0.4 }} />

        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '100px 40px', position: 'relative', zIndex: 1 }}>
          <div style={{ ...reveal('test') }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 1, background: C.primary }} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.primary }}>Community Voices</span>
                <div style={{ width: 40, height: 1, background: C.primary }} />
              </div>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 52, fontWeight: 600, letterSpacing: '-1.5px', color: C.text, margin: 0,
              }}>Trusted by our<br />growing family.</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {testimonials.map((t, i) => (
                <div key={i} className="testimonial-card" style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  padding: '32px 28px',
                  position: 'relative',
                }}>
                  {/* Quote mark */}
                  <div style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 80, color: 'rgba(46,125,50,0.1)',
                    lineHeight: 0.8, marginBottom: 24,
                    letterSpacing: '-4px',
                  }}>"</div>
                  <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.8, marginBottom: 28 }}>{t.text}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderTop: `1px solid ${C.border}`, paddingTop: 22 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      border: `1px solid ${C.border}`,
                      background: C.surfaceHigh,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 600, color: C.primary,
                    }}>
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: "'Outfit', sans-serif" }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: C.textLight, marginTop: 2, letterSpacing: '0.04em' }}>{t.role} · {t.co}</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <div style={{ color: C.primary, fontSize: 10, letterSpacing: 2 }}>★★★★★</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section data-s="cta" style={{ maxWidth: 1320, margin: '0 auto', padding: '120px 40px' }}>
        <div style={{ ...reveal('cta') }}>
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: '88px 64px',
            textAlign: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Corner accents */}
            {[
              { top: 0, left: 0, gradient: '135deg' },
              { top: 0, right: 0, gradient: '225deg' },
              { bottom: 0, left: 0, gradient: '45deg' },
              { bottom: 0, right: 0, gradient: '315deg' },
            ].map((corner, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: 120, height: 120,
                ...corner,
                background: `linear-gradient(${corner.gradient}, rgba(46,125,50,0.06) 0%, transparent 60%)`,
              }} />
            ))}

            {/* Central glow */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 600, height: 300,
              background: 'radial-gradient(ellipse, rgba(46,125,50,0.04) 0%, transparent 65%)',
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 40, height: 1, background: C.primary }} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.primary }}>Join the movement</span>
                <div style={{ width: 40, height: 1, background: C.primary }} />
              </div>

              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 64, fontWeight: 600, letterSpacing: '-2px', color: C.text,
                margin: '0 0 24px', lineHeight: 1.1,
              }}>
                Make every scrap<br />
                <span className="gold-shimmer">count for something.</span>
              </h2>

              <p style={{ fontSize: 16, color: C.textLight, maxWidth: 500, margin: '0 auto 48px', lineHeight: 1.75 }}>
                Join hundreds of Needy users, Guardians, and Hero recyclers building a circular economy — one verified pickup at a time.
              </p>

              <button
                onClick={go}
                className="cta-btn"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 12,
                  padding: '18px 56px',
                  fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                  borderRadius: 4, border: 'none',
                  background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`,
                  color: 'white', cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  boxShadow: '0 8px 32px rgba(46,125,50,0.25)',
                }}
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Report Waste Now'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '48px 40px', background: C.bgDeep }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <LogoMark size={32} />
              <div>
                <span style={{
                  fontSize: 18, fontWeight: 600,
                  fontFamily: "'Cormorant Garamond', serif",
                  color: C.text, letterSpacing: '-0.3px',
                }}>scrapair</span>
                <div style={{ height: 1, background: `linear-gradient(90deg, ${C.primary}, transparent)`, marginTop: 1 }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 36 }}>
              {['Privacy', 'Terms', 'Contact', 'Research'].map(l => (
                <span key={l} className="nav-link">{l}</span>
              ))}
            </div>

            <span style={{ fontSize: 11, color: C.textLighter, letterSpacing: '0.06em' }}>
              © 2025 Scrapair · Building a circular future.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}