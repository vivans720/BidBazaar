import React, { useState } from 'react';
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

  // Tab configuration with icons and labels
  const tabs = [
    { id: 'info', name: 'Account Information', icon: UserCircleIcon },
    { id: 'bids', name: 'Your Bids', icon: CurrencyRupeeIcon },
    { id: 'edit', name: 'Edit Profile', icon: PencilIcon },
    { id: 'password', name: 'Change Password', icon: KeyIcon },
  ];

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
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="User avatar"
                    className="h-24 w-24 rounded-full object-cover border-4 border-primary-50"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center border-4 border-primary-50">
                    <span className="text-primary-600 text-4xl font-medium">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-green-400 border-2 border-white"></div>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-800">{user?.name || "User"}</h2>
              <p className="text-sm text-gray-500">{user?.email || ""}</p>
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
            {/* Mobile Header */}
            <div className="lg:hidden mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{tabs.find(tab => tab.id === activeTab)?.name}</h1>
            </div>

            {/* Content */}
            <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden transition-all duration-300">
              <div className="p-6">
                {activeTab === 'info' && <UserInfo />}
                {activeTab === 'bids' && <UserBids />}
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