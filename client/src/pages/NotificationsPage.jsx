import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { 
  BellIcon, 
  XMarkIcon, 
  CheckIcon, 
  EyeIcon,
  TrashIcon 
} from '@heroicons/react/24/outline';

const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchNotifications(currentPage, filter === 'unread');
  }, [currentPage, filter, fetchNotifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'bid_placed':
        return '💰';
      case 'bid_outbid':
        return '⚡';
      case 'auction_won':
        return '🎉';
      case 'auction_lost':
        return '😔';
      case 'auction_ending_soon':
        return '⏰';
      case 'payment_received':
        return '💳';
      case 'payment_refunded':
        return '↩️';
      case 'product_approved':
        return '✅';
      case 'product_rejected':
        return '❌';
      case 'feedback_received':
        return '⭐';
      case 'system_announcement':
        return '📢';
      default:
        return '🔔';
    }
  };

  const formatNotificationTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    
    // Navigate to relevant page if URL is provided
    if (notification.data?.url) {
      window.location.href = notification.data.url;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="mt-2 text-gray-600">
                Stay updated with your auction activities
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Filter and Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'read'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Read ({notifications.length - unreadCount})
              </button>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {filter === 'unread' ? 'No unread notifications' : 
                 filter === 'read' ? 'No read notifications' : 'No notifications'}
              </h3>
              <p className="mt-2 text-gray-500">
                {filter === 'all' 
                  ? 'You\'ll receive notifications about your auction activities here'
                  : `No ${filter} notifications found`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer relative group ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-l-primary-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <span className="text-3xl">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {notification.title}
                          </h3>
                          <p className="mt-1 text-gray-600">
                            {notification.message}
                          </p>
                          <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                            <span>{formatNotificationTime(notification.createdAt)}</span>
                            {notification.data?.amount && (
                              <span className="font-medium text-green-600">
                                ₹{notification.data.amount}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification._id);
                              }}
                              className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                              title="Mark as read"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification._id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete notification"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {!notification.read && (
                        <div className="absolute top-6 right-6">
                          <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination could be added here if needed */}
        {filteredNotifications.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Showing {filteredNotifications.length} notifications
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
