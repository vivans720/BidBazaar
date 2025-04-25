import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserBids } from '../../utils/api';
import { toast } from 'react-toastify';

const UserBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserBids();
  }, []);

  const fetchUserBids = async () => {
    setLoading(true);
    try {
      const response = await getUserBids();
      setBids(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user bids:', err);
      setError('Failed to load your bids. Please try again later.');
      toast.error('Failed to load your bids');
      setLoading(false);
    }
  };

  // Format price function
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getBidStatusBadge = (bid) => {
    // First check the bid status directly - this is the most reliable indicator
    if (bid.status === 'won') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
          Won
        </span>
      );
    } else if (bid.status === 'lost') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
          Outbid
        </span>
      );
    }
    
    // For active bids, determine if they're the highest
    const isAuctionEnded = bid.product.status === 'ended' || bid.product.status === 'sold';
    
    if (isAuctionEnded) {
      // Fallback for legacy data where bid status might not be updated
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-1.5"></span>
          Auction Ended
        </span>
      );
    } else {
      // Auction is still active
      if (bid.isHighestBid) {
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>
            Highest Bid
          </span>
        );
      } else {
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5"></span>
            Outbid
          </span>
        );
      }
    }
  };

  // Get additional status information
  const getStatusInfo = (bid) => {
    if (bid.status === 'won') {
      return <div className="text-green-600 text-xs mt-1.5 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>You won this auction!</div>;
    } else if (bid.status === 'lost' && bid.product.status === 'ended') {
      const winningAmount = bid.product.currentPrice || bid.product.startingPrice;
      return <div className="text-gray-500 text-xs mt-1.5">Sold for {formatPrice(winningAmount)}</div>;
    } else if (bid.product.status === 'expired') {
      return <div className="text-gray-500 text-xs mt-1.5">Auction ended with no winner</div>;
    } else if (bid.isHighestBid) {
      return <div className="text-blue-600 text-xs mt-1.5 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>Your bid is currently leading</div>;
    }
    
    return null;
  };

  // Format date with relative time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
      }
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="animate-pulse h-6 w-48 bg-gray-200 rounded"></div>
          <div className="animate-pulse h-4 w-64 bg-gray-100 mt-2 rounded"></div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex space-x-4 items-center">
                <div className="animate-pulse h-12 w-12 bg-gray-200 rounded-md"></div>
                <div className="flex-1">
                  <div className="animate-pulse h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                  <div className="animate-pulse h-4 w-1/2 bg-gray-100 rounded"></div>
                </div>
                <div className="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-sm rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Your Bids</h3>
        </div>
        <div className="p-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Bids</h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Your Bids</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't placed any bids yet.
          </p>
        </div>
        <div className="px-6 py-10">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-4 text-base font-medium text-gray-900">No bids placed yet</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">Start bidding on products to see your bid history here. Browse our latest auctions to find something you like.</p>
            <div className="mt-6">
              <Link to="/products">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Browse Auctions
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-xl overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Your Bid History</h3>
        <p className="mt-1 text-sm text-gray-500">
          A history of all bids you've placed on the platform
        </p>
      </div>
      <div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bid Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {bids.map((bid) => (
                <tr key={bid._id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {bid.product.images && bid.product.images.length > 0 ? (
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-md object-cover" src={bid.product.images[0].url} alt="" />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {bid.product.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {bid.product.status === 'active' 
                            ? <span className="text-primary-600">Active until {new Date(bid.product.auctionEndTime).toLocaleDateString()}</span>
                            : <span>Ended on {new Date(bid.product.auctionEndTime).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{formatPrice(bid.amount)}</div>
                    {bid.product.currentPrice && (
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <span className="font-medium mr-1">Current:</span> {formatPrice(bid.product.currentPrice)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(bid.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getBidStatusBadge(bid)}
                    {getStatusInfo(bid)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/products/${bid.product._id}`} className="text-primary-600 hover:text-primary-900 rounded-md py-1 px-3 hover:bg-primary-50 transition-colors duration-150">
                      View Auction
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserBids; 