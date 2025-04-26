import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const UserInfo = () => {
  const { state } = useAuth();
  const { user } = state;

  if (!user) {
    return <div className="p-4 text-center text-gray-500">Loading user information...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Email Address</p>
              <p className="text-gray-900">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <IdentificationIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Account Type</p>
              <p className="text-gray-900 capitalize">{user.role}</p>
            </div>
          </div>
          
          {user.phone && (
            <div className="flex items-start">
              <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Phone Number</p>
                <p className="text-gray-900">{user.phone}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Address Information */}
      {(user.address?.street || user.address?.city || user.address?.state || user.address?.country) && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
            Address Information
          </h3>
          <div className="space-y-1 text-gray-700">
            {user.address?.street && <p>{user.address.street}</p>}
            <p>
              {user.address?.city && <span>{user.address.city}</span>}
              {user.address?.city && user.address?.state && <span>, </span>}
              {user.address?.state && <span>{user.address.state}</span>}
              {(user.address?.city || user.address?.state) && user.address?.zipCode && <span> - </span>}
              {user.address?.zipCode && <span>{user.address.zipCode}</span>}
            </p>
            {user.address?.country && <p>{user.address.country}</p>}
          </div>
        </div>
      )}

      {/* Account Stats */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="font-medium">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="font-medium">
              {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'N/A'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Account Status */}
      <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
        <div className="flex items-start">
          <svg className="h-5 w-5 text-primary-600 mt-0.5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-primary-800">Account Information</h3>
            <p className="mt-1 text-sm text-primary-700">
              Your account is active and in good standing. You can update your information at any time from the "Edit Profile" tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;