import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import messageService from '../services/messageService';

const MessagesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await messageService.getConversations();
      // Debug: Log the response structure
      console.log('=== MESSAGES API DEBUG ===');
      console.log('Full Response:', response);
      console.log('response.data type:', typeof response.data);
      console.log('response.data is array:', Array.isArray(response.data));
      console.log('Conversations to display:', response.data);
      
      // Extract the conversations array from nested data structure
      const conversationsArray = Array.isArray(response.data) ? response.data : [];
      setConversations(conversationsArray);

      // Load unread counts for each conversation
      const counts = {};
      for (const conv of conversationsArray) {
        try {
          const countResponse = await messageService.getUnreadCount();
          counts[conv.id] = countResponse.data?.unreadCount || 0;
        } catch (err) {
          console.warn('Failed to get unread count');
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

  if (loading) {
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
      <h2>Messages</h2>

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
