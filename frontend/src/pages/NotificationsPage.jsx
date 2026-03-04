import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import messageService from '../services/messageService';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [page]);

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await messageService.getNotifications(page, 20);
      // Extract notifications array
      let notificationsArray = [];
      if (Array.isArray(response.data)) {
        // Response.data is already an array
        notificationsArray = response.data;
      } else if (Array.isArray(response.data?.data)) {
        // Response.data.data is an array
        notificationsArray = response.data.data;
      } else if (response.data?.notifications && Array.isArray(response.data.notifications)) {
        // Try response.data.notifications
        notificationsArray = response.data.notifications;
      }
      if (page === 1) {
        setNotifications(notificationsArray);
      } else {
        setNotifications((prev) => [...prev, ...notificationsArray]);
      }
      setHasMore(notificationsArray.length === 20);
    } catch (err) {
      setError(err.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await messageService.markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await messageService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setError('Failed to mark all as read.');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await messageService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      setError('Failed to delete notification.');
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Please login to view notifications.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Notifications</h2>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllAsRead}
            style={{
              padding: '8px 15px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Mark All as Read
          </button>
        )}
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee', padding: '10px', borderRadius: '4px', color: '#c33', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading && page === 1 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <p>No notifications yet.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '10px' }}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '15px',
                  backgroundColor: notification.read ? 'white' : '#e3f2fd',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  gap: '10px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 5px 0', fontWeight: notification.read ? 'normal' : 'bold' }}>
                    {notification.title}
                  </p>
                  <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                    {notification.message}
                  </p>
                  <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Mark Read
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(notification.id)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationsPage;

