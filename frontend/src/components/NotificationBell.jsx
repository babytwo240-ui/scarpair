import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const NotificationBell = ({ size = 'medium' }) => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const sizeStyles = {
    small: { fontSize: '18px', padding: '4px' },
    medium: { fontSize: '24px', padding: '8px' },
    large: { fontSize: '32px', padding: '12px' },
  };

  const handleClick = () => {
    navigate('/notifications');
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'relative',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sizeStyles[size],
      }}
      title="View notifications"
    >
      {/* Bell Icon */}
      <div style={{ position: 'relative' }}>
        <span style={{ fontSize: '1.2em' }}>🔔</span>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-10px',
              backgroundColor: '#dc3545',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              border: '2px solid white',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
    </button>
  );
};

export default NotificationBell;
