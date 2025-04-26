import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  UserCircleIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const UserInfo = () => {
  const { state } = useAuth();
  const { user } = state;

  if (!user) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 bg-gray-300 rounded w-48 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    );
  }

  // Info items with icons
  const userInfoItems = [
    {
      id: 'name',
      label: 'Full name',
      value: user.name,
      icon: UserCircleIcon
    },
    {
      id: 'email',
      label: 'Email address',
      value: user.email,
      icon: EnvelopeIcon
    },
    {
      id: 'role',
      label: 'Account type',
      value: user.role,
      capitalize: true,
      icon: IdentificationIcon
    },
    {
      id: 'phone',
      label: 'Phone number',
      value: user.phone || 'Not provided',
      icon: PhoneIcon
    },
    {
      id: 'address',
      label: 'Address',
      value: formatAddress(user.address),
      icon: MapPinIcon
    }
  ];

  function formatAddress(address) {
    if (!address?.street) return 'Not provided';
    
    return [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country
    ].filter(Boolean).join(', ');
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Account Details</h3>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
          Active Account
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {userInfoItems.map((item) => (
          <div 
            key={item.id} 
            className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="flex p-4">
              <div className="flex-shrink-0 mr-4">
                <div className="h-10 w-10 bg-primary-50 rounded-full flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{item.label}</p>
                <p className={`text-base text-gray-900 ${item.capitalize ? 'capitalize' : ''}`}>
                  {item.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-primary-50 rounded-lg p-4 border border-primary-100">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <svg className="h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-primary-800">Account information</h3>
            <div className="mt-2 text-sm text-primary-700">
              <p>
                This information is visible to other users when they view your profile or products.
                You can update your information from the "Edit Profile" tab.
              </p>
            </div>
          </div>
        </div>
      </div>

      {user.role === 'seller' && (
        <div className="mt-6 bg-white rounded-lg border border-gray-100 shadow-sm p-4">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Seller Statistics</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-xs mb-1">Active Listings</p>
              <p className="text-2xl font-semibold text-gray-900">12</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-xs mb-1">Items Sold</p>
              <p className="text-2xl font-semibold text-gray-900">24</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-xs mb-1">Avg. Rating</p>
              <p className="text-2xl font-semibold text-gray-900">4.8</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-xs mb-1">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">₹24.5K</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfo;