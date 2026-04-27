import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import messageService from '../services/messageService';
import socketService from '../services/socketService';

/* ─── Color tokens – Matching Landing Page Design System ────────────── */
const C = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  primaryLight: '#4CAF50',
  bright: '#2E7D32',
  brightDark: '#1B5E20',
  brightLight: '#4CAF50',
  bg: '#FFFFFF',
  darker: '#FFFFFF',
  bgDeep: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceHigh: '#F9FAFB',
  cardHover: '#F1F5F9',
  border: '#E5E7EB',
  borderHover: '#2E7D32',
  text: '#1F2937',
  textLight: '#4B5563',
  textMid: '#4B5563',
  textLow: '#94a3b8',
  textLighter: '#9CA3AF',
  error: '#dc2626',
  errorBg: 'rgba(220,38,38,0.08)',
  errorBorder: 'rgba(220,38,38,0.25)',
  info: '#2563eb',
  infoBg: 'rgba(37,99,235,0.08)',
  infoBorder: 'rgba(37,99,235,0.2)',
  glowLight: 'rgba(46,125,50,0.08)',
  glowStrong: 'rgba(46,125,50,0.2)',
};

// Floating Chat Widget Component
const FloatingChatWidget = ({
  selectedConv,
  user,
  onClose,
  onMinimize,
  isMinimized,
  token
}) => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [sending, setSending] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const otherParticipant = selectedConv
    ? (selectedConv.participant1?.id === user.id ? selectedConv.participant2 : selectedConv.participant1)
    : null;
  const wastePost = selectedConv?.wastePost;

  useEffect(() => {
    if (!selectedConv) return;
    loadMessages();
    initializeSocket();
  }, [selectedConv?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeSocket = () => {
    try {
      socketService.emit('conversation:join', parseInt(selectedConv.id));

      socketService.on('message:received', (data) => {
        if (data.conversationId === parseInt(selectedConv.id)) {
          setMessages((prev) => {
            if (prev.find(m => m.id === data.id)) return prev;
            return [...prev, data];
          });
        }
      });

      socketService.on('user:typing', (data) => {
        if (data.conversationId === parseInt(selectedConv.id) && data.userId !== user.id) {
          setOtherUserTyping(true);
        }
      });

      socketService.on('user:stop-typing', (data) => {
        if (data.conversationId === parseInt(selectedConv.id)) {
          setOtherUserTyping(false);
        }
      });
    } catch (err) {
      console.error('Socket error:', err);
    }

    return () => {
      if (selectedConv) {
        socketService.emit('conversation:leave', parseInt(selectedConv.id));
      }
    };
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await messageService.getConversationMessages(selectedConv.id, 1, 100);
      setMessages(response.data || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result || '');
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadMessageImage = async () => {
    if (!imageFile) return '';
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const response = await messageService.uploadMessageImage(formData);
      return response.data?.imageUrl || '';
    } catch (err) {
      setError('Failed to upload image');
      return '';
    } finally {
      setImageUploading(false);
    }
  };

  const handleMessageContentChange = (e) => {
    const content = e.target.value;
    setMessageContent(content);

    if (content.trim()) {
      socketService.emit('message:typing', parseInt(selectedConv.id));
    }

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      socketService.emit('message:stop-typing', parseInt(selectedConv.id));
    }, 2000);

    setTypingTimeout(timeout);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageContent.trim() && !imageFile) {
      setError('Please enter a message or select an image.');
      return;
    }

    setSending(true);
    setError('');

    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadMessageImage();
      }

      const optimisticMessage = {
        id: Date.now(),
        conversationId: parseInt(selectedConv.id),
        senderId: user.id,
        recipientId: otherParticipant?.id,
        sender: {
          id: user.id,
          businessName: user.businessName,
          email: user.email
        },
        content: messageContent,
        imageUrl: imageUrl || null,
        createdAt: new Date().toISOString()
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      await messageService.sendMessage(
        selectedConv.id,
        otherParticipant?.id,
        messageContent,
        imageUrl
      );

      setMessageContent('');
      setImageFile(null);
      setImagePreview('');
    } catch (err) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (isMinimized) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      width: 400,
      height: '90vh',
      maxHeight: 700,
      background: C.surface,
      borderRadius: '16px 16px 0 0',
      border: `1px solid ${C.border}`,
      borderBottom: 'none',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.1)',
      zIndex: 999,
      animation: 'slideInRight 0.3s ease',
      fontFamily: "'Outfit', sans-serif",
      color: C.text,
    }}>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bounce { 0%, 80%, 100% { opacity: 0.5; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-5px); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        *::-webkit-scrollbar { width: 6px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: rgba(46,125,50,0.2); border-radius: 3px; }
        *::-webkit-scrollbar-thumb:hover { background: rgba(46,125,50,0.4); }
      `}</style>

      {/* Header */}
      <div style={{ background: C.surfaceHigh, borderBottom: `1px solid ${C.border}`, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0, borderRadius: '16px 16px 0 0' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.bright }}>
            {otherParticipant?.businessName || otherParticipant?.name || 'Chat'}
          </h3>
          {wastePost && <p style={{ margin: '4px 0 0', fontSize: 10, color: C.textMid }}>📦 {wastePost.title}</p>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {wastePost && (
            <button
              onClick={() => setExpandedProduct(wastePost)}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                color: C.bright,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = C.bright; e.target.style.background = C.glowLight; }}
              onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; }}
            >
              Item
            </button>
          )}
          <button onClick={() => onMinimize()} style={{ padding: '6px 12px', background: 'transparent', color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.borderColor = C.bright; e.target.style.color = C.bright; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.text; }}>−</button>
          <button onClick={() => onClose()} style={{ padding: '6px 12px', background: 'transparent', color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.borderColor = C.error; e.target.style.color = C.error; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.text; }}>×</button>
        </div>
      </div>

      {/* Messages Container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: C.textMid, margin: 'auto' }}>
            <div style={{ width: 24, height: 24, border: `2px solid ${C.border}`, borderTopColor: C.bright, borderRadius: '50%', margin: '0 auto 8px', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: 12 }}>Loading...</div>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.textMid, margin: 'auto' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>💬</div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>No messages yet</div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: msg.senderId === user.id ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%',
                backgroundColor: msg.senderId === user.id ? C.bright : C.surfaceHigh,
                color: msg.senderId === user.id ? '#ffffff' : C.text,
                padding: '10px 14px',
                borderRadius: msg.senderId === user.id ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                wordWrap: 'break-word',
                boxShadow: msg.senderId === user.id ? `0 2px 6px ${C.glowStrong}` : 'none',
              }}>
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="Attachment" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, marginBottom: msg.content ? 8 : 0, display: 'block' }} />
                )}
                {msg.content && <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5 }}>{msg.content}</p>}
                <p style={{ margin: '4px 0 0 0', fontSize: 9, opacity: 0.7 }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}

        {otherUserTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ backgroundColor: C.surfaceHigh, padding: '10px 14px', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: 3, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: 4, height: 4, backgroundColor: C.bright, borderRadius: '50%', animation: `bounce 1.4s infinite ${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div style={{ padding: 12, borderTop: `1px solid ${C.border}`, background: C.surfaceHigh }}>
          <div style={{ position: 'relative', width: 'fit-content' }}>
            <img src={imagePreview} alt="Preview" style={{ maxWidth: 60, maxHeight: 60, borderRadius: 8, border: `1px solid ${C.border}` }} />
            <button
              onClick={() => { setImageFile(null); setImagePreview(''); }}
              style={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, backgroundColor: C.error, color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ backgroundColor: C.errorBg, border: `1px solid ${C.errorBorder}`, color: C.error, padding: 10, borderRadius: 8, fontSize: 11, margin: 12, marginBottom: 0 }}>
          {error}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} style={{ padding: 12, borderTop: `1px solid ${C.border}`, background: C.surfaceHigh, display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
        <textarea
          value={messageContent}
          onChange={handleMessageContentChange}
          placeholder="Message..."
          rows="2"
          style={{
            flex: 1,
            padding: '10px 12px',
            border: `1px solid ${C.border}`,
            backgroundColor: C.surface,
            color: C.text,
            borderRadius: 8,
            fontFamily: "'Outfit', sans-serif",
            fontSize: 12,
            resize: 'none',
            transition: 'all 0.2s',
          }}
          onFocus={e => { e.target.style.borderColor = C.bright; e.target.style.boxShadow = `0 0 0 3px ${C.glowLight}`; }}
          onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
        />
        <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} id="msg-img-float" />
        <label htmlFor="msg-img-float" style={{ padding: '10px 12px', backgroundColor: C.surface, border: `1px solid ${C.border}`, color: C.text, borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.glowLight; e.currentTarget.style.borderColor = C.bright; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.surface; e.currentTarget.style.borderColor = C.border; }}>
          📷
        </label>
        <button type="submit" disabled={sending || imageUploading} style={{ padding: '10px 16px', background: C.bright, color: '#ffffff', border: 'none', borderRadius: 8, cursor: sending || imageUploading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 12, transition: 'all 0.2s', opacity: sending || imageUploading ? 0.6 : 1 }}>
          {sending ? '...' : '→'}
        </button>
      </form>

      {/* Expanded Product Modal */}
      {expandedProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, animation: 'fadeIn 0.2s' }} onClick={() => setExpandedProduct(null)}>
          <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, maxWidth: 420, maxHeight: '80vh', overflowY: 'auto', padding: 24, position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setExpandedProduct(null)} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', fontSize: 16, color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>

            <div style={{ backgroundColor: C.surfaceHigh, borderRadius: 12, overflow: 'hidden', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              {expandedProduct.imageUrls?.[0] ? (
                <img src={expandedProduct.imageUrls[0]} alt={expandedProduct.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ color: C.textMid }}>No image</div>
              )}
            </div>

            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: C.bright, fontFamily: "'Cormorant Garamond', serif" }}>
              {expandedProduct.title}
            </h2>

            {expandedProduct.pricePerUnit && (
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.bright, marginBottom: 12 }}>
                ₱{Number(expandedProduct.pricePerUnit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                {expandedProduct.unit && <span style={{ fontSize: 12, color: C.textMid }}>/{expandedProduct.unit}</span>}
              </p>
            )}

            {expandedProduct.description && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 11, color: C.textLow, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Description</h3>
                <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.6 }}>
                  {expandedProduct.description}
                </p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {expandedProduct.quantity && (
                <div style={{ backgroundColor: C.glowLight, border: `1px solid ${C.border}`, padding: 12, borderRadius: 8 }}>
                  <p style={{ margin: 0, fontSize: 9, color: C.textLow, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Qty</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: C.bright, fontWeight: 700 }}>
                    {expandedProduct.quantity} {expandedProduct.unit || ''}
                  </p>
                </div>
              )}
              {expandedProduct.location && (
                <div style={{ backgroundColor: C.glowLight, border: `1px solid ${C.border}`, padding: 12, borderRadius: 8 }}>
                  <p style={{ margin: 0, fontSize: 9, color: C.textLow, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>📍 Location</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text, fontWeight: 600 }}>
                    {expandedProduct.location}
                  </p>
                </div>
              )}
            </div>

            {expandedProduct.materials?.length > 0 && (
              <div style={{ backgroundColor: C.glowLight, border: `1px solid ${C.border}`, padding: 12, borderRadius: 8, marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 9, color: C.textLow, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 4 }}>Materials</p>
                <p style={{ margin: 0, fontSize: 12, color: C.text, fontWeight: 600 }}>
                  {expandedProduct.materials.map(m => m.name).join(', ')}
                </p>
              </div>
            )}

            {expandedProduct.status && (
              <div style={{ display: 'inline-block', backgroundColor: expandedProduct.status === 'available' ? C.glowLight : C.errorBg, color: expandedProduct.status === 'available' ? C.bright : C.error, padding: '8px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ● {expandedProduct.status}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MessagesPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [hoveredConv, setHoveredConv] = useState(null);
  const intervalRef = useRef(null);

  // Floating chat state
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [minimizedLabel, setMinimizedLabel] = useState('');

  // Handle Page Visibility API
  useEffect(() => {
    const handleVisibilityChange = () => setIsPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Mouse and scroll tracking
  useEffect(() => {
    const mm = (e) => setMouse({ x: e.clientX, y: e.clientY });
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('mousemove', mm);
    window.addEventListener('scroll', sc);
    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('scroll', sc);
    };
  }, []);

  // Polling effect
  useEffect(() => {
    if (!isPageVisible) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    loadConversations();
    intervalRef.current = setInterval(loadConversations, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPageVisible]);

  // WebSocket listener
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleConversationUpdate = () => {
      messageService.clearConversationsCache();
      loadConversations();
    };

    socketService.onConversationUpdate(handleConversationUpdate);
    return () => {
      socketService.off('conversation:updated');
    };
  }, []);

  const loadConversations = async (ignoreCache = false) => {
    if (messageService.isCacheValid() && !ignoreCache) {
      setLoading(false);
    } else {
      setLoading(true);
    }

    setError('');
    try {
      const response = await messageService.getConversations(ignoreCache);
      const conversationsArray = Array.isArray(response.data) ? response.data : [];
      setConversations(conversationsArray);

      const counts = {};
      for (const conv of conversationsArray) {
        try {
          const countResponse = await messageService.getUnreadCount();
          counts[conv.id] = countResponse.data?.unreadCount || 0;
        } catch (err) { }
      }
      setUnreadCounts(counts);
    } catch (err) {
      setError(err.message || 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (conversationId, businessName) => {
    setSelectedConversationId(conversationId);
    setIsMinimized(false);
    setMinimizedLabel(businessName?.substring(0, 15) || 'Chat');
  };

  const handleCloseChat = () => {
    setSelectedConversationId(null);
    setIsMinimized(false);
  };

  const handleMinimizeChat = () => {
    setIsMinimized(true);
  };

  const handleManualRefresh = () => {
    loadConversations(true);
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", color: C.text }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: C.error }}>Please login to view messages</p>
          <button onClick={() => navigate('/role-selection')} style={{ padding: '10px 24px', background: C.bright, border: 'none', borderRadius: 8, color: '#ffffff', fontWeight: 700, cursor: 'pointer', marginTop: 16, transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.background = C.brightDark; e.target.style.transform = 'scale(1.02)'; }} onMouseLeave={e => { e.target.style.background = C.bright; e.target.style.transform = 'scale(1)'; }}>Login</button>
        </div>
      </div>
    );
  }

  const selectedConv = conversations.find(c => c.id === selectedConversationId);

  return (
    <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'Outfit', sans-serif", overflowX: 'hidden', color: C.text, position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #FFFFFF; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(3deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(-2deg); }
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
        .conv-card {
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }
        .conv-card::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #2E7D32, transparent);
          transform: scaleX(0);
          transition: transform 0.4s ease;
        }
        .conv-card:hover::after { transform: scaleX(1); }
        .conv-card:hover {
          transform: translateY(-4px) !important;
          background: #F9FAFB !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.08), 0 0 0 1px rgba(46,125,50,0.15) !important;
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
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: 0 12px 32px rgba(46,125,50,0.3), 0 4px 12px rgba(0,0,0,0.1) !important;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #F1F5F9; }
        ::-webkit-scrollbar-thumb { background: rgba(46,125,50,0.3); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(46,125,50,0.6); }
      `}</style>

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-15%', right: '-10%',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46,125,50,0.04) 0%, transparent 65%)',
          animation: 'floatA 14s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '-8%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46,125,50,0.03) 0%, transparent 65%)',
          animation: 'floatB 18s ease-in-out infinite',
        }} />
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

      {/* Background Effects */}
      <div style={{ position: 'fixed', top: mouse.y - 320, left: mouse.x - 320, width: 640, height: 640, background: `radial-gradient(circle, ${C.glowLight} 0%, transparent 65%)`, borderRadius: '50%', pointerEvents: 'none', zIndex: 0, transition: 'top 0.35s ease, left 0.35s ease' }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.015'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />

      {/* Navigation */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrollY > 30 ? 'rgba(255,255,255,0.92)' : 'transparent', backdropFilter: scrollY > 30 ? 'blur(24px) saturate(1.5)' : 'none', borderBottom: scrollY > 30 ? `1px solid ${C.border}` : '1px solid transparent', transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
            {/* LogoMark matching landing page */}
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(46,125,50,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              flexShrink: 0, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)', borderRadius: '11px 11px 0 0' }} />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8L12 3L20 8L12 13L4 8Z" />
                <path d="M4 14L12 19L20 14" />
                <path d="M4 11L12 16L20 11" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', fontFamily: "'Cormorant Garamond', serif", color: C.text }}>scrapair</span>
              <div style={{ height: 1.5, background: `linear-gradient(90deg, ${C.primary}, transparent)`, marginTop: 1, width: '100%' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={handleManualRefresh} style={{ padding: '10px 22px', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 4, border: `1px solid ${C.border}`, background: 'transparent', color: C.textLight, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'all 0.25s ease' }} onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textLight; }}>↻ Refresh</button>
            <button className="cta-btn" onClick={() => navigate(-1)} style={{ padding: '10px 26px', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 4, border: 'none', background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`, color: 'white', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", boxShadow: '0 4px 20px rgba(46,125,50,0.25)' }}>← Back</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '60px 40px 100px', position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ marginBottom: 48, animation: 'fadeUp 0.7s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: C.primary }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.primary }}>Communication</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 56, fontWeight: 600, letterSpacing: '-1.5px', margin: '0 0 12px', color: C.text, lineHeight: 1.1 }}>Your Messages</h1>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: C.textLight, margin: 0, maxWidth: 460 }}>Click on any conversation to start chatting</p>
        </div>

        {/* Info Messages */}
        {!isPageVisible && (
          <div style={{ background: C.infoBg, border: `1px solid ${C.infoBorder}`, borderRadius: 8, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: C.info, fontWeight: 500 }}>💤 Polling paused - click Refresh to update</span>
          </div>
        )}
        {error && (
          <div style={{ background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: 8, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: C.error, fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Conversations List */}
        {loading && conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.textMid }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.bright, margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: 14 }}>Loading conversations...</div>
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 48, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif", color: C.text, margin: '0 0 6px' }}>No conversations yet</h3>
            <p style={{ fontSize: 12, color: C.textMid, margin: 0 }}>Start a conversation by posting waste or requesting a collection</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {conversations.map((conversation, index) => {
              const unreadCount = unreadCounts[conversation.id] || 0;
              const otherParticipant = conversation.participant1?.id === user.id ? conversation.participant2 : conversation.participant1;
              const isActive = selectedConversationId === conversation.id;

              return (
                <div
                  key={conversation.id}
                  className="conv-card"
                  onClick={() => handleOpenChat(conversation.id, otherParticipant?.businessName || otherParticipant?.name)}
                  style={{
                    background: isActive ? 'rgba(46,125,50,0.04)' : C.surface,
                    border: `1px solid ${isActive ? C.primary : C.border}`,
                    borderRadius: 6,
                    padding: '24px 28px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                    animation: `fadeUp 0.5s ease ${index * 0.06}s both`,
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 4,
                    border: `1px solid ${C.border}`,
                    background: C.surfaceHigh,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>💬</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'Cormorant Garamond', serif", letterSpacing: '-0.3px' }}>
                      {otherParticipant?.businessName || otherParticipant?.companyName || otherParticipant?.email || 'Unknown'}
                      {unreadCount > 0 && (
                        <span style={{ fontSize: 10, background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`, color: '#ffffff', padding: '2px 8px', borderRadius: 2, fontWeight: 700, fontFamily: "'Outfit', sans-serif", letterSpacing: '0.04em' }}>
                          {unreadCount} new
                        </span>
                      )}
                    </h3>
                    {conversation.wastePost && (
                      <p style={{ fontSize: 12, color: C.primary, margin: '0 0 4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ opacity: 0.7 }}>📦</span> {conversation.wastePost.title}
                      </p>
                    )}
                    {conversation.lastMessage && (
                      <p style={{ fontSize: 14, color: C.textLight, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.7 }}>
                        {conversation.lastMessage}
                      </p>
                    )}
                  </div>
                  <div style={{ color: C.primary, flexShrink: 0, fontSize: 18, fontWeight: 300 }}>
                    →
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Floating Chat Widget */}
      {selectedConversationId && !isMinimized && selectedConv && (
        <FloatingChatWidget
          selectedConv={selectedConv}
          user={user}
          onClose={handleCloseChat}
          onMinimize={handleMinimizeChat}
          isMinimized={isMinimized}
          token={token}
        />
      )}

      {/* Minimized Chat Button */}
      {selectedConversationId && isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            padding: '12px 20px',
            background: C.bright,
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 13,
            zIndex: 999,
            boxShadow: `0 4px 12px ${C.glowStrong}`,
            transition: 'all 0.2s',
            animation: 'slideInUp 0.3s ease',
            fontFamily: "'Outfit', sans-serif",
          }}
          onMouseEnter={e => { e.target.style.background = C.brightDark; e.target.style.transform = 'scale(1.02)'; e.target.style.boxShadow = `0 6px 16px ${C.glowStrong}`; }}
          onMouseLeave={e => { e.target.style.background = C.bright; e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = `0 4px 12px ${C.glowStrong}`; }}
        >
          💬 {minimizedLabel}
        </button>
      )}

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{
        borderTop: `1px solid ${C.border}`,
        padding: '48px 40px',
        position: 'relative',
        zIndex: 2,
        marginTop: 60,
      }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(46,125,50,0.2)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8L12 3L20 8L12 13L4 8Z" />
                <path d="M4 14L12 19L20 14" />
              </svg>
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: C.text, letterSpacing: '-0.3px' }}>scrapair</span>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <span key={l} style={{ fontSize: 13, color: C.textLighter, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = C.primary}
                onMouseLeave={e => e.target.style.color = C.textLighter}
              >{l}</span>
            ))}
          </div>
          <span style={{ fontSize: 12, color: C.textLighter }}>© 2025 Scrapair · Building a circular future.</span>
        </div>
      </footer>
    </div>
  );
};

export default MessagesPage;