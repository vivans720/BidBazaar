import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { getUserBids } from "../utils/api";
import { formatCurrency } from "../utils/format";
import api from "../utils/api";

const AuctionsPage = () => {
  const { user } = useAuth().state;
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [userBids, setUserBids] = useState([]);
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [expiredAuctions, setExpiredAuctions] = useState([]);

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

        // Fetch all expired auctions from the entire site (independent of user bids)
        try {
          // Use axios directly without authentication to ensure public access
          const expiredProductsResponse = await fetch('/api/products?status=ended&limit=50', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (expiredProductsResponse.ok) {
            const data = await expiredProductsResponse.json();
            const expiredProducts = data.data || [];
            setExpiredAuctions(expiredProducts);
            console.log(`Successfully fetched ${expiredProducts.length} expired auctions`);
          } else {
            console.error("Failed to fetch expired auctions:", expiredProductsResponse.status);
            setExpiredAuctions([]);
          }
        } catch (error) {
          console.error("Error fetching expired auctions:", error);
          // Fallback: try with api instance
          try {
            const fallbackResponse = await api.get("/products?status=ended&limit=50");
            const expiredProducts = fallbackResponse.data.data || [];
            setExpiredAuctions(expiredProducts);
            console.log(`Fallback: Successfully fetched ${expiredProducts.length} expired auctions`);
          } catch (fallbackError) {
            console.error("Fallback also failed:", fallbackError);
            setExpiredAuctions([]);
          }
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
              <h1 className="text-3xl font-bold text-gray-900">Auctions</h1>
              <p className="mt-2 text-gray-600">
                Browse active auctions and view your auction history
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("active")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "active"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Active Auctions ({activeAuctions.length})
              </button>
              <button
                onClick={() => setActiveTab("expired")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "expired"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                All Expired Auctions ({expiredAuctions.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
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
            ) : activeTab === "active" ? (
              <div>
                {activeAuctions.length === 0 ? (
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
                        to="/products"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Browse All Products
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
            ) : (
              <div>
                {expiredAuctions.length === 0 ? (
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      No Expired Auctions
                    </h3>
                    <p className="mt-2 text-gray-500">
                      There are no expired auctions on the platform yet.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setActiveTab("active")}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Browse Active Auctions
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {expiredAuctions.map((auction) => {
                      const userBid = userBids.find(bid => bid.product && bid.product._id === auction._id);
                      const hasUserBid = !!userBid;
                      const isWinner = userBid && userBid.status === "won";
                      
                      return (
                        <div
                          key={auction._id}
                          className="bg-white border border-gray-200 rounded-lg p-6"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <img
                                src={auction.images?.[0]?.url || "/placeholder-product.png"}
                                alt={auction.title}
                                className="w-20 h-20 object-cover rounded-md mr-4"
                                onError={(e) => {
                                  e.target.src = "/placeholder-product.png";
                                }}
                              />
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  {auction.title}
                                </h3>
                                <p className="text-sm text-gray-500 mb-1">
                                  {auction.category}
                                </p>
                                <p className="text-sm text-gray-600 mb-1">
                                  Seller: {auction.vendor?.name || "Unknown"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Ended: {new Date(auction.endTime).toLocaleDateString()} at{" "}
                                  {new Date(auction.endTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 mt-2">
                                  Ended
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="space-y-2">
                                <div>
                                  <span className="text-sm text-gray-600">Final Price:</span>
                                  <div className="font-bold text-lg text-gray-900">
                                    {formatCurrency(auction.currentPrice)}
                                  </div>
                                </div>
                                
                                <div>
                                  <span className="text-sm text-gray-600">Starting Price:</span>
                                  <div className="text-sm text-gray-500">
                                    {formatCurrency(auction.startingPrice)}
                                  </div>
                                </div>
                                
                                {hasUserBid && (
                                  <>
                                    <div>
                                      <span className="text-sm text-gray-600">Your Bid:</span>
                                      <div className="font-medium text-blue-600">
                                        {formatCurrency(userBid.amount)}
                                      </div>
                                    </div>
                                    
                                    <div className="mt-3">
                                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                        isWinner 
                                          ? "bg-green-100 text-green-800" 
                                          : "bg-red-100 text-red-800"
                                      }`}>
                                        {isWinner ? "🎉 You Won!" : "You Lost"}
                                      </span>
                                    </div>
                                    
                                    {isWinner && (
                                      <div className="mt-2">
                                        <Link
                                          to={`/feedback/submit/${auction._id}`}
                                          className="text-sm text-primary-600 hover:text-primary-500"
                                        >
                                          Leave Feedback →
                                        </Link>
                                      </div>
                                    )}
                                  </>
                                )}
                                
                                {!hasUserBid && (
                                  <div className="mt-3">
                                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-600">
                                      No Participation
                                    </span>
                                  </div>
                                )}
                                
                                {/* View Details Button */}
                                <div className="mt-4">
                                  <Link
                                    to={`/products/${auction._id}`}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 mr-2"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                      />
                                    </svg>
                                    View Auction Details
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionsPage;
