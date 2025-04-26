import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileForm from '../components/profile/ProfileForm';
import PasswordForm from '../components/profile/PasswordForm';
import UserInfo from '../components/dashboard/UserInfo';
import UserBids from '../components/user/UserBids';

// Icons import - these should be available in your node_modules if you're using Tailwind/Heroicons
// If not, you may need to install them: npm install @heroicons/react
import { 
  UserCircleIcon, 
  CurrencyRupeeIcon, 
  PencilIcon, 
  KeyIcon, 
  ArrowLeftIcon,
  BellIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { state } = useAuth();
  const { isAuthenticated, loading, user } = state;
  const [activeTab, setActiveTab] = useState('info');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isAdmin = user?.role === 'admin';

  // Tab configuration with icons and labels
  const getTabs = () => {
    const allTabs = [
      { id: 'info', name: 'Account Information', icon: UserCircleIcon },
      { id: 'bids', name: 'Your Bids', icon: CurrencyRupeeIcon, hideForAdmin: true },
      { id: 'edit', name: 'Edit Profile', icon: PencilIcon },
      { id: 'password', name: 'Change Password', icon: KeyIcon },
    ];

    return isAdmin 
      ? allTabs.filter(tab => !tab.hideForAdmin) 
      : allTabs;
  };

  // Get filtered tabs based on user role
  const tabs = getTabs();

  // Ensure active tab is valid in case it was hidden due to role change
  useEffect(() => {
    if (isAdmin && activeTab === 'bids') {
      setActiveTab('info');
    }
  }, [isAdmin, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-gray-300 h-20 w-20 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-48 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar Toggle for Mobile */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md bg-white shadow-md text-gray-600 hover:text-primary-600 focus:outline-none"
          >
            <ArrowLeftIcon className={`h-5 w-5 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Sidebar */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:relative lg:translate-x-0 z-40 bg-white shadow-lg h-screen w-64 transition-transform duration-300 ease-in-out`}>
          <div className="p-6 flex flex-col h-full">
            {/* User avatar and info */}
            <div className="flex flex-col items-center mb-8 mt-4">
              <div className="relative">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={`${user.name}'s profile`}
                    className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
                    onError={(e) => {
                      console.error("ProfilePage sidebar image load error:", user.profileImage);
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150?text=User';
                    }}
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center border-4 border-white shadow-md">
                    <span className="text-primary-600 text-4xl font-medium">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-green-400 border-2 border-white"></div>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-800">{user?.name || "User"}</h2>
              <p className="text-sm text-gray-500">{user?.email || ""}</p>
              {isAdmin && (
                <span className="mt-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                  Admin
                </span>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-3 py-3 text-sm font-medium rounded-md w-full transition-colors`}
                >
                  <tab.icon
                    className={`${
                      activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-5 w-5`}
                    aria-hidden="true"
                  />
                  {tab.name}
                </button>
              ))}
            </nav>

            {/* Extra links */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-1">
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
                  <ShoppingBagIcon className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400" />
                  My Purchases
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
                  <BellIcon className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400" />
                  Notifications
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Mobile Header with Profile */}
            <div className="lg:hidden mb-6">
              <div className="flex items-center mb-4">
                <div className="relative mr-3">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={`${user.name}'s profile`}
                      className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-md"
                      onError={(e) => {
                        console.error("ProfilePage mobile image load error:", user.profileImage);
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150?text=User';
                      }}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center border-2 border-white shadow-md">
                      <span className="text-primary-600 text-2xl font-medium">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-400 border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user?.name || "User"}</h1>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">{tabs.find(tab => tab.id === activeTab)?.name}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || "User"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Banner - Desktop Only */}
            <div className="hidden lg:block mb-6">
              <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-32 relative"></div>
                <div className="px-6 pb-5 pt-16 relative">
                  <div className="absolute top-0 left-6 transform -translate-y-1/2 flex items-end">
                    <div className="relative">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={`${user.name}'s profile`}
                          className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                          onError={(e) => {
                            console.error("ProfilePage banner image load error:", user.profileImage);
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150?text=User';
                          }}
                        />
                      ) : (
                        <div className="h-32 w-32 rounded-full bg-primary-100 flex items-center justify-center border-4 border-white shadow-lg">
                          <span className="text-primary-600 text-5xl font-medium">
                            {user?.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full bg-green-400 border-2 border-white"></div>
                    </div>
                  </div>
                  <div className="ml-40">
                    <h2 className="text-2xl font-bold text-gray-900">{user?.name || "User"}</h2>
                    <p className="text-gray-500">{user?.email || ""}</p>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || "User"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden transition-all duration-300">
              <div className="p-6">
                {activeTab === 'info' && <UserInfo />}
                {!isAdmin && activeTab === 'bids' && <UserBids />}
                {activeTab === 'edit' && <ProfileForm />}
                {activeTab === 'password' && <PasswordForm />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;