import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import BuyerDashboard from '../components/dashboard/BuyerDashboard';
import VendorDashboard from '../components/dashboard/VendorDashboard';

const DashboardPage = () => {
  const { state } = useAuth();
  const { isAuthenticated, user, loading } = state;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  console.log('Current user:', user);

  const renderDashboard = () => {
    console.log('Rendering dashboard for role:', user?.role);
    
    if (!user) {
      return <div>Loading user data...</div>;
    }

    switch (user.role.toLowerCase()) {
      case 'admin':
        return <AdminDashboard />;
      case 'vendor':
        return <VendorDashboard />;
      case 'buyer':
        return <BuyerDashboard />;
      default:
        console.log('Unknown role:', user.role);
        return <BuyerDashboard />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="mt-2 text-lg text-gray-600">
            {user?.role === 'vendor' 
              ? "Manage your listings and track your sales"
              : user?.role === 'admin'
              ? "Monitor site activity and manage users"
              : "Browse auctions and manage your bids"}
          </p>
        </div>
        {renderDashboard()}
      </div>
    </div>
  );
};

export default DashboardPage;