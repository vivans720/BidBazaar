import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { getUserBids } from "../../utils/api";
import WalletBalance from "../wallet/WalletBalance";
import PendingFeedback from "../feedback/PendingFeedback";
import { formatCurrency } from "../../utils/format";
import api from "../../utils/api";

const BuyerDashboard = () => {
  const { user } = useAuth().state;
  const [bidStats, setBidStats] = useState({
    activeBids: 0,
    wonAuctions: 0,
    totalBids: 0,
  });
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bid stats
        const bidsResponse = await getUserBids();
        const bids = bidsResponse.data;

        const activeBids = bids.filter((bid) => bid.status === "active").length;
        const wonAuctions = bids.filter((bid) => bid.status === "won").length;

        setBidStats({
          activeBids,
          wonAuctions,
          totalBids: bids.length,
        });

        // Fetch wallet balance
        try {
          const walletResponse = await api.get("/wallet");
          setWalletBalance(walletResponse.data.data.balance || 0);
        } catch (walletError) {
          console.error("Error fetching wallet balance:", walletError);
          setWalletBalance(0);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Buyer Dashboard
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Welcome back, {user?.name}!
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {/* Wallet Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              Wallet Overview
            </h4>
            <Link
              to="/wallet"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              Manage Wallet
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <WalletBalance />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-primary-50 p-6 rounded-lg shadow-sm">
            <h4 className="text-lg font-medium text-primary-800 mb-2">
              Current Balance
            </h4>
            {loading ? (
              <div className="animate-pulse h-8 bg-primary-200 rounded w-20"></div>
            ) : (
              <>
                <p className="text-3xl font-bold text-primary-600">
                  {formatCurrency(walletBalance)}
                </p>
                <p className="text-sm text-primary-700 mt-2">
                  Available for bidding
                </p>
              </>
            )}
          </div>

          <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
            <h4 className="text-lg font-medium text-blue-800 mb-2">
              Active Bids
            </h4>
            {loading ? (
              <div className="animate-pulse h-8 bg-blue-200 rounded w-16"></div>
            ) : (
              <>
                <p className="text-3xl font-bold text-blue-600">
                  {bidStats.activeBids}
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  {bidStats.activeBids === 0
                    ? "You have no active bids"
                    : `You have ${bidStats.activeBids} active bid${
                        bidStats.activeBids !== 1 ? "s" : ""
                      }`}
                </p>
              </>
            )}
          </div>

          <div className="bg-green-50 p-6 rounded-lg shadow-sm">
            <h4 className="text-lg font-medium text-green-800 mb-2">
              Won Auctions
            </h4>
            {loading ? (
              <div className="animate-pulse h-8 bg-green-200 rounded w-16"></div>
            ) : (
              <>
                <p className="text-3xl font-bold text-green-600">
                  {bidStats.wonAuctions}
                </p>
                <p className="text-sm text-green-700 mt-2">
                  {bidStats.wonAuctions === 0
                    ? "You haven't won any auctions yet"
                    : `You've won ${bidStats.wonAuctions} auction${
                        bidStats.wonAuctions !== 1 ? "s" : ""
                      }`}
                </p>
              </>
            )}
          </div>

          <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
            <h4 className="text-lg font-medium text-purple-800 mb-2">
              Total Bids
            </h4>
            {loading ? (
              <div className="animate-pulse h-8 bg-purple-200 rounded w-16"></div>
            ) : (
              <>
                <p className="text-3xl font-bold text-purple-600">
                  {bidStats.totalBids}
                </p>
                <p className="text-sm text-purple-700 mt-2">
                  {bidStats.totalBids === 0
                    ? "You haven't placed any bids yet"
                    : `You've placed ${bidStats.totalBids} bid${
                        bidStats.totalBids !== 1 ? "s" : ""
                      } in total`}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Pending Feedback Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              Pending Reviews
            </h4>
          </div>
          <PendingFeedback />
        </div>

        {/* Quick Actions Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Quick Actions</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/auctions" className="bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="flex items-center">
                <svg className="h-8 w-8 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <div>
                  <h5 className="font-medium text-blue-900">View Auctions</h5>
                  <p className="text-sm text-blue-700">Browse active & expired auctions</p>
                </div>
              </div>
            </Link>
            
            <Link to="/bids" className="bg-green-50 p-6 rounded-lg hover:bg-green-100 transition-colors">
              <div className="flex items-center">
                <svg className="h-8 w-8 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div>
                  <h5 className="font-medium text-green-900">Your Bids</h5>
                  <p className="text-sm text-green-700">Track all your bidding activity</p>
                </div>
              </div>
            </Link>
            
            <Link to="/products" className="bg-purple-50 p-6 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="flex items-center">
                <svg className="h-8 w-8 text-purple-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div>
                  <h5 className="font-medium text-purple-900">Browse Products</h5>
                  <p className="text-sm text-purple-700">Discover new items to bid on</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
