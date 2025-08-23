import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { getUserBids } from "../utils/api";
import { formatCurrency } from "../utils/format";
import api from "../utils/api";

const AuctionsPage = () => {
  const { user } = useAuth().state;
  const [loading, setLoading] = useState(true);
  const [userBids, setUserBids] = useState([]);
  const [activeAuctions, setActiveAuctions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user bids (optional - don't fail if this errors)
        let bids = [];
        try {
          const bidsResponse = await getUserBids();
          bids = bidsResponse.data || [];
          setUserBids(bids);
        } catch (error) {
          console.error("Error fetching user bids:", error);
          setUserBids([]);
        }

        // Fetch active auctions (independent of user bids)
        try {
          // Use fetch directly for public endpoints to avoid auth issues
          const activeProductsResponse = await fetch('/api/products?status=active&limit=20', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (activeProductsResponse.ok) {
            const data = await activeProductsResponse.json();
            const activeProducts = data.data || [];
            setActiveAuctions(activeProducts);
            console.log(`Successfully fetched ${activeProducts.length} active auctions`);
          } else {
            console.error("Failed to fetch active auctions:", activeProductsResponse.status);
            setActiveAuctions([]);
          }
        } catch (error) {
          console.error("Error fetching active auctions:", error);
          setActiveAuctions([]);
        }

      } catch (error) {
        console.error("Error fetching auctions data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Real-time countdown component
  const CountdownTimer = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
      const calculateTimeLeft = () => {
        const now = new Date();
        const end = new Date(endTime);
        const diff = end - now;

        if (diff <= 0) {
          setTimeLeft('Ended');
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        let result = '';
        if (days > 0) result += `${days}d `;
        if (hours > 0 || days > 0) result += `${hours}h `;
        if (minutes > 0 || hours > 0 || days > 0) result += `${minutes}m `;
        if (days === 0) result += `${seconds}s`;

        setTimeLeft(result.trim());
      };

      calculateTimeLeft();
      const interval = setInterval(calculateTimeLeft, 1000);

      return () => clearInterval(interval);
    }, [endTime]);

    return (
      <span className={`text-sm font-medium ${timeLeft === 'Ended' ? 'text-red-600' : 'text-red-600'}`}>
        {timeLeft}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Active Auctions</h1>
              <p className="mt-2 text-gray-600">
                Browse and participate in live auctions
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Active Auctions Content */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-100 rounded-lg p-4"
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-md mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeAuctions.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No Active Auctions
                </h3>
                <p className="mt-2 text-gray-500">
                  There are currently no active auctions available.
                </p>
                <div className="mt-6">
                  <Link
                    to="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeAuctions.map((auction) => (
                  <div
                    key={auction._id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center mb-3">
                      <img
                        src={auction.images?.[0]?.url || "/placeholder-product.png"}
                        alt={auction.title}
                        className="w-16 h-16 object-cover rounded-md mr-3"
                        onError={(e) => {
                          e.target.src = "/placeholder-product.png";
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {auction.title}
                        </h3>
                        <p className="text-sm text-gray-500">{auction.category}</p>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mt-1">
                          Active
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Current Price:</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(auction.currentPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Starting Price:</span>
                        <span className="text-sm text-gray-900">
                          {formatCurrency(auction.startingPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Ends:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(auction.endTime).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Time Left:</span>
                        <CountdownTimer endTime={auction.endTime} />
                      </div>
                    </div>

                    <Link to={`/products/${auction._id}`}>
                      <button className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                        View & Place Bid
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionsPage;
