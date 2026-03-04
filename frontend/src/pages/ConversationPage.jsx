import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import messageService from '../services/messageService';
import socketService from '../services/socketService';
import imageService from '../services/imageService';

const ConversationPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [sending, setSending] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Initial load
  useEffect(() => {
    loadConversation();
    loadMessages();
    initializeSocket();

    return () => {
      // Cleanup polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      // Leave conversation room on unmount
      if (socketService.isConnected()) {
        socketService.emit('conversation:leave', parseInt(conversationId));
      }
    };
  }, [conversationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start polling for new messages
  useEffect(() => {
    if (messages.length > 0) {
      // Start polling every 2 seconds for new messages (fallback if WebSocket fails)
      pollingIntervalRef.current = setInterval(() => {
        pollForNewMessages();
      }, 2000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setHasNewMessages(false); // Clear "new messages" indicator
  };

  const pollForNewMessages = async () => {
    try {
      const response = await messageService.getConversationMessages(conversationId, 1, 50);
      const newMessages = response.data || [];

      if (newMessages.length > messages.length) {
        // New messages received
        setMessages(newMessages);
        setLastMessageId(newMessages[newMessages.length - 1]?.id);

        // Show indicator if user is not at the bottom
        const container = document.querySelector('[style*="overflow"]');
        if (container && container.scrollTop < container.scrollHeight - 500) {
          setHasNewMessages(true);
        } else {
          scrollToBottom();
        }
      }
    } catch (err) {
    }
  };

  const initializeSocket = () => {
    try {
      const socket = socketService.connect(token);
      
      // Join conversation room for real-time updates
      socketService.emit('conversation:join', parseInt(conversationId));
      // Listen for incoming messages - REAL TIME
      socketService.on('message:received', (data) => {
        if (data.conversationId === parseInt(conversationId)) {
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.find(m => m.id === data.id)) {
              return prev;
            }
            return [...prev, data];
          });
          setLastMessageId(data.id);
          setOtherUserTyping(false);
        }
      });
      
      // Listen for typing indicator
      socketService.on('user:typing', (data) => {
        if (data.conversationId === parseInt(conversationId) && data.userId !== user.id) {
          setOtherUserTyping(true);
        }
      });
      
      // Listen for stop typing
      socketService.on('user:stop-typing', (data) => {
        if (data.conversationId === parseInt(conversationId)) {
          setOtherUserTyping(false);
        }
      });
      
      socketService.on('connect', () => {
        socketService.emit('conversation:join', parseInt(conversationId));
      });
      
      socketService.on('disconnect', () => {
      });
      
    } catch (err) {
    }
  };

  const loadConversation = async () => {
    try {
      const response = await messageService.getConversation(conversationId);
      setConversation(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load conversation.');
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await messageService.getConversationMessages(conversationId, 1, 50);
      const loadedMessages = response.data || [];
      setMessages(loadedMessages);
      if (loadedMessages.length > 0) {
        setLastMessageId(loadedMessages[loadedMessages.length - 1]?.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadMessageImage = async () => {
    if (!imageFile) return null;

    setImageUploading(true);
    try {
      const response = await imageService.uploadImage(imageFile);
      return response.data.imageUrl;
    } catch (err) {
      setError('Failed to upload image. ' + (err.message || ''));
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  const handleMessageContentChange = (e) => {
    const content = e.target.value;
    setMessageContent(content);
    
    // Send typing indicator
    if (!isTyping && content.trim()) {
      setIsTyping(true);
      socketService.emit('message:typing', parseInt(conversationId));
    }
    
    // Reset typing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Stop typing after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      setIsTyping(false);
      socketService.emit('message:stop-typing', parseInt(conversationId));
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
    setIsTyping(false);
    socketService.emit('message:stop-typing', parseInt(conversationId));

    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadMessageImage();
      }

      const otherParticipant = 
        conversation?.participant1?.id === user.id 
          ? conversation?.participant2 
          : conversation?.participant1;

      // Optimistic update - add message immediately
      const optimisticMessage = {
        id: Date.now(), // Temporary ID
        conversationId: parseInt(conversationId),
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
      
      // Add to messages immediately (optimistic)
      setMessages((prev) => [...prev, optimisticMessage]);

      // Send to backend
      await messageService.sendMessage(
        conversationId,
        otherParticipant?.id,
        messageContent,
        imageUrl
      );

      setMessageContent('');
      setImageFile(null);
      setImagePreview('');
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    } catch (err) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px 20px', textAlign: 'center' }}>Loading conversation...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Please login to view messages.</p>
      </div>
    );
  }

  const otherParticipant = 
    conversation?.participant1?.id === user.id 
      ? conversation?.participant2 
      : conversation?.participant1;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            opacity: 0.5;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-5px);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
      {/* Header */}
      <div
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #ddd',
          padding: '15px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <button
          onClick={() => navigate('/messages')}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
          }}
        >
          â†
        </button>
        <div>
          <h3 style={{ margin: 0 }}>{otherParticipant?.businessName || otherParticipant?.email}</h3>
          {conversation?.wastePost && (
            <p style={{ margin: '3px 0 0 0', color: '#666', fontSize: '13px' }}>
              Re: {conversation.wastePost.title}
            </p>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {error && (
          <div style={{ backgroundColor: '#fee', padding: '10px', borderRadius: '4px', color: '#c33' }}>
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              style={{
                alignSelf: message.senderId === user.id ? 'flex-end' : 'flex-start',
                maxWidth: '70%',
              }}
            >
              <div
                style={{
                  backgroundColor: message.senderId === user.id ? '#007bff' : '#e0e0e0',
                  color: message.senderId === user.id ? 'white' : 'black',
                  padding: '10px 15px',
                  borderRadius: '12px',
                }}
              >
                {message.imageUrl && (
                  <img
                    src={message.imageUrl}
                    alt="Message attachment"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '8px',
                      marginBottom: message.content ? '8px' : 0,
                    }}
                  />
                )}
                {message.content && <p style={{ margin: 0 }}>{message.content}</p>}
                <p
                  style={{
                    margin: '5px 0 0 0',
                    fontSize: '12px',
                    opacity: 0.7,
                  }}
                >
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {otherUserTyping && (
          <div
            style={{
              alignSelf: 'flex-start',
              maxWidth: '70%',
            }}
          >
            <div
              style={{
                backgroundColor: '#e0e0e0',
                color: 'black',
                padding: '10px 15px',
                borderRadius: '12px',
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '12px', fontStyle: 'italic' }}>typing</span>
              <span style={{ display: 'flex', gap: '2px' }}>
                <span style={{ 
                  width: '4px', 
                  height: '4px', 
                  backgroundColor: '#999',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite'
                }} />
                <span style={{ 
                  width: '4px', 
                  height: '4px', 
                  backgroundColor: '#999',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite 0.2s'
                }} />
                <span style={{ 
                  width: '4px', 
                  height: '4px', 
                  backgroundColor: '#999',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite 0.4s'
                }} />
              </span>
            </div>
          </div>
        )}

        {hasNewMessages && (
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button
              onClick={scrollToBottom}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                animation: 'pulse 2s infinite'
              }}
            >
              âœ“ New messages - Jump to latest
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div
        style={{
          backgroundColor: 'white',
          borderTop: '1px solid #ddd',
          padding: '15px 20px',
        }}
      >
        {imagePreview && (
          <div style={{ marginBottom: '10px', position: 'relative', width: 'fit-content' }}>
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                maxWidth: '100px',
                maxHeight: '100px',
                borderRadius: '4px',
              }}
            />
            <button
              onClick={() => {
                setImageFile(null);
                setImagePreview('');
              }}
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
              }}
            >
              âœ•
            </button>
          </div>
        )}

        <form
          onSubmit={handleSendMessage}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            gap: '10px',
            alignItems: 'end',
          }}
        >
          <textarea
            value={messageContent}
            onChange={handleMessageContentChange}
            placeholder="Type your message..."
            rows="2"
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'inherit',
              resize: 'none',
            }}
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{
              display: 'none',
            }}
            id="message-image-input"
          />

          <label
            htmlFor="message-image-input"
            style={{
              padding: '8px 12px',
              backgroundColor: '#6c757d',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              textAlign: 'center',
              fontSize: '14px',
            }}
          >
            ðŸ“Ž
          </label>

          <button
            type="submit"
            disabled={sending || imageUploading}
            style={{
              padding: '8px 15px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: sending || imageUploading ? 'not-allowed' : 'pointer',
              opacity: sending || imageUploading ? 0.6 : 1,
            }}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConversationPage;

