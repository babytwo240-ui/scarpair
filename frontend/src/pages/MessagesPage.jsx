import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import messageService from '../services/messageService';
import socketService from '../services/socketService';

const MessagesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const intervalRef = useRef(null);

  // Handle Page Visibility API - pause polling when tab is inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      const hidden = document.hidden;
      setIsPageVisible(!hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Polling effect - only polls when page is visible
  useEffect(() => {
    if (!isPageVisible) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    loadConversations();
    intervalRef.current = setInterval(loadConversations, 30000); // Refresh every 30 seconds
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPageVisible]);

  // WebSocket listener for real-time conversation updates
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleConversationUpdate = (data) => {
      // Clear cache and reload when notified of updates
      messageService.clearConversationsCache();
      loadConversations();
    };

    // Listen for conversation updates via WebSocket
    socketService.onConversationUpdate(handleConversationUpdate);

    return () => {
      socketService.off('conversation:updated');
    };
  }, []);

  const loadConversations = async (ignoreCache = false) => {
    // Don't show loading if we have cached data
    if (messageService.isCacheValid() && !ignoreCache) {
      setLoading(false);
    } else {
      setLoading(true);
    }
    
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await messageService.getConversations(ignoreCache);
      const conversationsArray = Array.isArray(response.data) ? response.data : [];
      setConversations(conversationsArray);

      // Load unread counts for each conversation
      const counts = {};
      for (const conv of conversationsArray) {
        try {
          const countResponse = await messageService.getUnreadCount();
          counts[conv.id] = countResponse.data?.unreadCount || 0;
        } catch (err) {
        }
      }
      setUnreadCounts(counts);
    } catch (err) {
      setError(err.message || 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConversation = (conversationId) => {
    navigate(`/messages/${conversationId}`);
  };

  // Manual refresh button handler
  const handleManualRefresh = () => {
    loadConversations(true); // Ignore cache and force refresh
  };

  if (loading && conversations.length === 0) {
    return <div style={{ padding: '40px 20px', textAlign: 'center' }}>Loading conversations...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Please login to view messages.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Messages</h2>
        <button
          onClick={handleManualRefresh}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Refresh
        </button>
      </div>

      {!isPageVisible && (
        <div style={{ backgroundColor: '#fff3cd', padding: '10px', borderRadius: '4px', color: '#856404', marginBottom: '20px', fontSize: '14px' }}>
          ðŸ’¤ Polling paused (tab inactive) - click Refresh to update
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#fee', padding: '10px', borderRadius: '4px', color: '#c33', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {conversations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <p>No conversations yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {conversations.map((conversation) => {
            const unreadCount = unreadCounts[conversation.id] || 0;
            const otherParticipant = 
              conversation.participant1?.id === user.id 
                ? conversation.participant2 
                : conversation.participant1;

            return (
              <div
                key={conversation.id}
                onClick={() => handleOpenConversation(conversation.id)}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '15px',
                  backgroundColor: unreadCount > 0 ? '#e3f2fd' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = unreadCount > 0 ? '#bbdefb' : '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = unreadCount > 0 ? '#e3f2fd' : 'white';
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>
                    {otherParticipant?.businessName || otherParticipant?.email || 'Unknown'}
                  </h4>
                  <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                    {conversation.wastePost && `Re: ${conversation.wastePost.title}`}
                  </p>
                  {conversation.lastMessage && (
                    <p style={{ color: '#999', fontSize: '13px', margin: '5px 0 0 0' }}>
                      {conversation.lastMessage.substring(0, 50)}...
                    </p>
                  )}
                </div>

                {unreadCount > 0 && (
                  <div
                    style={{
                      backgroundColor: '#2196f3',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    {unreadCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MessagesPage;

