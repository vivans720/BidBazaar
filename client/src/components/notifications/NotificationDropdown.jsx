import React, { useState, useEffect, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && !loading) {
      fetchNotifications(1, false); // Fetch all notifications when dropdown opens
    }
  }, [isOpen]);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    setIsOpen(false);
    
    // Navigate to relevant page if URL is provided
    if (notification.data?.url) {
      window.location.href = notification.data.url;
    }
  };

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

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        className="rounded-full bg-primary-500 p-1 text-white hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 mr-3 relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sr-only">View notifications</span>
        <BellIcon className="h-6 w-6" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[20px] h-5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        show={isOpen}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-96 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Menu.Item key={notification._id}>
                  {({ active }) => (
                    <div
                      className={`${
                        active ? 'bg-gray-50' : ''
                      } ${
                        !notification.read ? 'bg-blue-50' : ''
                      } px-4 py-3 border-b border-gray-100 cursor-pointer relative group`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <span className="text-2xl">
                            {getNotificationIcon(notification.type)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification._id);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                              {formatNotificationTime(notification.createdAt)}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Menu.Item>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <Link
                to="/notifications"
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                onClick={() => setIsOpen(false)}
              >
                View all notifications →
              </Link>
            </div>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default NotificationDropdown;
