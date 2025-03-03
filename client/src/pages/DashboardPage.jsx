import React from 'react';
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

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'vendor':
        return <VendorDashboard />;
      case 'buyer':
      default:
        return <BuyerDashboard />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
        {renderDashboard()}
      </div>
    </div>
  );
};

export default DashboardPage;