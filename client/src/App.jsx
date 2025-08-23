import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import { LenisProvider } from "./context/LenisContext";
import { NotificationProvider } from "./context/NotificationContext";
import PrivateRoute from "./utils/PrivateRoute";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ScrollToTopButton from "./components/layout/ScrollToTopButton";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import ProductList from "./components/products/ProductList";
import CreateProduct from "./components/products/CreateProduct";
import ProductDetailPage from "./pages/ProductDetailPage";
import UserBidsPage from "./pages/UserBidsPage";
import WalletPage from "./pages/WalletPage";
import FeedbackPage from "./pages/FeedbackPage";
import FeedbackSubmissionPage from "./pages/FeedbackSubmissionPage";
import NotificationsPage from "./pages/NotificationsPage";
import TokenDebugger from "./components/debug/TokenDebugger";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <LenisProvider>
            <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/debug" element={<TokenDebugger />} />

                {/* Protected routes for all authenticated users */}
                <Route
                  element={
                    <PrivateRoute allowedRoles={["admin", "vendor", "buyer"]} />
                  }
                >
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/bids" element={<UserBidsPage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route
                    path="/feedback/:productId"
                    element={<FeedbackPage />}
                  />
                  <Route
                    path="/feedback/submit/:productId"
                    element={<FeedbackSubmissionPage />}
                  />
                </Route>

                {/* Protected routes for vendors */}
                <Route element={<PrivateRoute allowedRoles={["vendor"]} />}>
                  <Route path="/products/create" element={<CreateProduct />} />
                </Route>

                {/* Protected route for the dashboard - each role sees their specific dashboard */}
                <Route
                  element={
                    <PrivateRoute allowedRoles={["admin", "vendor", "buyer"]} />
                  }
                >
                  <Route path="/dashboard" element={<DashboardPage />} />
                </Route>

                <Route
                  path="*"
                  element={
                    <div className="text-center py-10">Page not found</div>
                  }
                />
              </Routes>
            </main>
            <Footer />
            <ScrollToTopButton />
            </div>
            <ToastContainer position="top-right" autoClose={5000} />
          </LenisProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
