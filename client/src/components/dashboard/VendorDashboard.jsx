import React from 'react';
import { useAuth } from '../../context/AuthContext';

const VendorDashboard = () => {
  const { state } = useAuth();
  const { user } = state;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Vendor Dashboard</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Welcome back, {user?.name}!
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-primary-50 p-6 rounded-lg shadow-sm">
            <h4 className="text-lg font-medium text-primary-800 mb-2">Active Listings</h4>
            <p className="text-3xl font-bold text-primary-600">0</p>
            <p className="text-sm text-primary-700 mt-2">You have no active listings</p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg shadow-sm">
            <h4 className="text-lg font-medium text-green-800 mb-2">Completed Sales</h4>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-sm text-green-700 mt-2">No completed sales yet</p>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-lg shadow-sm">
            <h4 className="text-lg font-medium text-yellow-800 mb-2">Pending Approval</h4>
            <p className="text-3xl font-bold text-yellow-600">0</p>
            <p className="text-sm text-yellow-700 mt-2">No listings pending approval</p>
          </div>
        </div>
        
        <div className="mt-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Vendor Actions</h4>
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-500">Start selling your products today!</p>
            <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              Create New Listing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;