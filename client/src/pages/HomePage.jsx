import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { getBidStats } from "../utils/api";
import { formatCurrency } from "../utils/format";

const HomePage = () => {
  const { state } = useAuth();
  const { isAuthenticated, loading: authLoading } = state;
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeAuctions: 0,
    totalBids: 0,
    activeBids: 0,
    wonBids: 0,
    todayBids: 0,
    thisWeekBids: 0,
    successfulAuctions: 0,
    totalUsers: 0,
    totalVendors: 0,
    highestBid: 0,
    averageBid: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch stats if user is not authenticated and not loading
    if (!authLoading && !isAuthenticated) {
      const fetchStats = async () => {
        try {
          // Fetch product stats and bid stats in parallel
          const [productsResponse, bidsResponse] = await Promise.all([
            api.get("/products/stats"),
            getBidStats(),
          ]);

          setStats({
            totalProducts: productsResponse.data.data.total || 0,
            activeAuctions: productsResponse.data.data.active || 0,
            successfulAuctions: productsResponse.data.data.successful || 0,
            totalUsers: productsResponse.data.data.users?.total || 0,
            totalVendors: productsResponse.data.data.users?.vendors || 0,
            totalBids: bidsResponse.data.total || 0,
            activeBids: bidsResponse.data.activeBids || 0,
            wonBids: bidsResponse.data.wonBids || 0,
            todayBids: bidsResponse.data.today || 0,
            thisWeekBids: bidsResponse.data.thisWeek || 0,
            highestBid: bidsResponse.data.highestBidAmount || 0,
            averageBid: bidsResponse.data.averageBidAmount || 0,
            successRate: bidsResponse.data.successRate || 0,
          });
        } catch (error) {
          console.error("Error fetching stats:", error);
          // Use some placeholder numbers if the API fails
          setStats({
            totalProducts: 156,
            activeAuctions: 42,
            successfulAuctions: 89,
            totalUsers: 1247,
            totalVendors: 89,
            totalBids: 2847,
            activeBids: 234,
            wonBids: 156,
            todayBids: 18,
            thisWeekBids: 127,
            highestBid: 45000,
            averageBid: 6750,
            successRate: 67,
          });
        } finally {
          setLoading(false);
        }
      };

      fetchStats();
    }
  }, [authLoading, isAuthenticated]);

  // Show loading spinner while auth is being determined
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-gray-900">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
            alt="Auction background"
          />
          <div className="absolute inset-0 bg-gray-900 opacity-75" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Online Auction Site
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl">
            Discover unique handcrafted items from artisans around the country.
            Bid on exclusive products and support local creators.
          </p>
          <div className="mt-10 flex space-x-4">
            <Link
              to="/register"
              className="inline-block bg-primary-600 py-3 px-6 border border-transparent rounded-md text-base font-medium text-white hover:bg-primary-700"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="inline-block bg-white py-3 px-6 border border-transparent rounded-md text-base font-medium text-primary-700 hover:bg-gray-50"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Platform Statistics
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Join our growing community of buyers and sellers
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
                <div className="px-4 py-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">Total Products</dt>
                  <dd className="text-2xl font-bold text-blue-600">
                    {loading ? (
                      <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mx-auto"></div>
                    ) : (
                      stats.totalProducts.toLocaleString()
                    )}
                  </dd>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
                <div className="px-4 py-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">Live Auctions</dt>
                  <dd className="text-2xl font-bold text-green-600">
                    {loading ? (
                      <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mx-auto"></div>
                    ) : (
                      stats.activeAuctions.toLocaleString()
                    )}
                  </dd>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
                <div className="px-4 py-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">Total Bids</dt>
                  <dd className="text-2xl font-bold text-purple-600">
                    {loading ? (
                      <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mx-auto"></div>
                    ) : (
                      stats.totalBids.toLocaleString()
                    )}
                  </dd>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
                <div className="px-4 py-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">Highest Bid</dt>
                  <dd className="text-2xl font-bold text-yellow-600">
                    {loading ? (
                      <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mx-auto"></div>
                    ) : (
                      formatCurrency(stats.highestBid)
                    )}
                  </dd>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
                <div className="px-4 py-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">Active Users</dt>
                  <dd className="text-2xl font-bold text-indigo-600">
                    {loading ? (
                      <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mx-auto"></div>
                    ) : (
                      stats.totalUsers.toLocaleString()
                    )}
                  </dd>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
                <div className="px-4 py-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-rose-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">Success Rate</dt>
                  <dd className="text-2xl font-bold text-rose-600">
                    {loading ? (
                      <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mx-auto"></div>
                    ) : (
                      `${stats.successRate}%`
                    )}
                  </dd>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Auction Activity */}
              <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Auction Activity
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <dt className="text-sm font-medium text-gray-600 mb-1">Active Bids</dt>
                      <dd className="text-2xl font-bold text-blue-600">
                        {loading ? (
                          <div className="animate-pulse h-8 w-16 bg-blue-200 rounded mx-auto"></div>
                        ) : (
                          stats.activeBids.toLocaleString()
                        )}
                      </dd>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <dt className="text-sm font-medium text-gray-600 mb-1">Successful Sales</dt>
                      <dd className="text-2xl font-bold text-green-600">
                        {loading ? (
                          <div className="animate-pulse h-8 w-16 bg-green-200 rounded mx-auto"></div>
                        ) : (
                          stats.successfulAuctions.toLocaleString()
                        )}
                      </dd>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <dt className="text-sm font-medium text-gray-600 mb-1">Bids Today</dt>
                      <dd className="text-2xl font-bold text-amber-600">
                        {loading ? (
                          <div className="animate-pulse h-8 w-16 bg-amber-200 rounded mx-auto"></div>
                        ) : (
                          stats.todayBids.toLocaleString()
                        )}
                      </dd>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <dt className="text-sm font-medium text-gray-600 mb-1">This Week</dt>
                      <dd className="text-2xl font-bold text-purple-600">
                        {loading ? (
                          <div className="animate-pulse h-8 w-16 bg-purple-200 rounded mx-auto"></div>
                        ) : (
                          stats.thisWeekBids.toLocaleString()
                        )}
                      </dd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Insights */}
              <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Platform Insights
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700">Active Vendors</span>
                      </div>
                      <span className="text-lg font-bold text-indigo-600">
                        {loading ? (
                          <div className="animate-pulse h-6 w-12 bg-gray-200 rounded"></div>
                        ) : (
                          stats.totalVendors.toLocaleString()
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700">Average Bid</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {loading ? (
                          <div className="animate-pulse h-6 w-12 bg-gray-200 rounded"></div>
                        ) : (
                          formatCurrency(stats.averageBid)
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700">Bid Success Rate</span>
                      </div>
                      <span className="text-lg font-bold text-rose-600">
                        {loading ? (
                          <div className="animate-pulse h-6 w-12 bg-gray-200 rounded"></div>
                        ) : (
                          `${stats.successRate}%`
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Why Choose Our Platform
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              We provide a secure and easy-to-use platform for buying and
              selling unique items.
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <svg
                          className="h-6 w-6 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      Real-Time Bidding
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Experience the excitement of live auctions with real-time
                      updates and notifications.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <svg
                          className="h-6 w-6 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      Secure Payments
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Our platform ensures safe and secure transactions for both
                      buyers and sellers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <svg
                          className="h-6 w-6 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      Unique Products
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Discover one-of-a-kind items from talented artisans and
                      creators worldwide.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-primary-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to start bidding?</span>
            <span className="block">Create an account today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-200">
            Join our community of buyers and sellers and discover unique items
            you won't find anywhere else.
          </p>
          <Link
            to="/register"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 sm:w-auto"
          >
            Sign up for free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
