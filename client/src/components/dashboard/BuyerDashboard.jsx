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

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Your Bids</h4>
            <Link
              to="/bids"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all bids
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-100 p-4 rounded-lg"
                >
                  <div className="flex justify-between">
                    <div className="w-1/2">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="w-1/4">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : bidStats.totalBids === 0 ? (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <p className="text-gray-500">You haven't placed any bids yet</p>
              <Link to="/products">
                <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  Browse Auctions
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <p className="text-gray-700">
                You have {bidStats.activeBids} active bids and have won{" "}
                {bidStats.wonAuctions} auctions.
              </p>
              <div className="mt-4 flex justify-center space-x-4">
                <Link to="/bids">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    View Your Bids
                  </button>
                </Link>
                <Link to="/products">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Browse More Auctions
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
