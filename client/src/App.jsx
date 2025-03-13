import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './utils/PrivateRoute';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ProductList from './components/products/ProductList';
import CreateProduct from './components/products/CreateProduct';
import ProductDetailPage from './pages/ProductDetailPage';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              
              {/* Protected routes for all authenticated users */}
              <Route element={<PrivateRoute allowedRoles={['admin', 'vendor', 'buyer']} />}>
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Protected routes for vendors */}
              <Route element={<PrivateRoute allowedRoles={['vendor']} />}>
                <Route path="/products/create" element={<CreateProduct />} />
              </Route>

              {/* Protected route for the dashboard - each role sees their specific dashboard */}
              <Route element={<PrivateRoute allowedRoles={['admin', 'vendor', 'buyer']} />}>
                <Route path="/dashboard" element={<DashboardPage />} />
              </Route>
              
              <Route path="*" element={<div className="text-center py-10">Page not found</div>} />
            </Routes>
          </main>
          <Footer />
        </div>
        <ToastContainer position="top-right" autoClose={5000} />
      </AuthProvider>
    </Router>
  );
};

export default App;