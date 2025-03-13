import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const BuyerDashboard = () => {
  const { state } = useAuth();
  const { user } = state;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Buyer Dashboard</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Welcome back, {user?.name}!
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-primary-50 p-6 rounded-lg shadow-sm">
            <h4 className="text-lg font-medium text-primary-800 mb-2">Active Bids</h4>
            <p className="text-3xl font-bold text-primary-600">0</p>
            <p className="text-sm text-primary-700 mt-2">You have no active bids</p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg shadow-sm">
            <h4 className="text-lg font-medium text-green-800 mb-2">Won Auctions</h4>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-sm text-green-700 mt-2">You haven't won any auctions yet</p>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
            <h4 className="text-lg font-medium text-purple-800 mb-2">Watchlist</h4>
            <p className="text-3xl font-bold text-purple-600">0</p>
            <p className="text-sm text-purple-700 mt-2">No items in your watchlist</p>
          </div>
        </div>
        
        <div className="mt-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h4>
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-500">No recent activity to display</p>
            <Link to="/products">
              <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                Browse Auctions
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;