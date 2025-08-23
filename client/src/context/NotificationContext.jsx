import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async (page = 1, unreadOnly = false) => {
    try {
      setLoading(true);
      const response = await api.get(`/notifications?page=${page}&unreadOnly=${unreadOnly}`);
      
      if (response.data.success) {
        setNotifications(response.data.data || []);
        setUnreadCount(response.data.pagination?.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set empty notifications array on error to show "No notifications" message
      setNotifications([]);
      setUnreadCount(0);
      // Only show toast error if it's not a 404 or authentication issue
      if (error.response?.status !== 404 && error.response?.status !== 401) {
        toast.error('Failed to fetch notifications');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count only
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Set unread count to 0 on error to prevent showing incorrect badge
      setUnreadCount(0);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, read: true, readAt: new Date() }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await api.patch('/notifications/mark-all-read');
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(notif => ({ 
            ...notif, 
            read: true, 
            readAt: new Date() 
          }))
        );
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      if (response.data.success) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        // Update unread count if the deleted notification was unread
        const deletedNotif = notifications.find(n => n._id === notificationId);
        if (deletedNotif && !deletedNotif.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Add new notification (for real-time updates)
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
  };

  // Periodically fetch unread count
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
