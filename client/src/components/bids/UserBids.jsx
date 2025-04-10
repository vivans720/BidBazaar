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
    // Determine the auction status based on product status and bid status
    const isAuctionEnded = bid.product.status === 'sold' || bid.product.status === 'expired';
    
    if (isAuctionEnded) {
      if (bid.status === 'won') {
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Won</span>;
      } else if (bid.product.status === 'sold') {
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Outbid</span>;
      } else {
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Auction Ended</span>;
      }
    } else {
      // Auction is still active
      if (bid.isHighestBid) {
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Highest Bid</span>;
      } else {
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Outbid</span>;
      }
    }
  };

  // Get additional status information
  const getStatusInfo = (bid) => {
    if (bid.product.status === 'sold') {
      if (bid.status === 'won') {
        return <div className="text-green-600 text-xs mt-1">You won this auction!</div>;
      } else {
        const winningAmount = bid.product.currentPrice || bid.product.startingPrice;
        return <div className="text-gray-500 text-xs mt-1">Sold for {formatPrice(winningAmount)}</div>;
      }
    } else if (bid.product.status === 'expired') {
      return <div className="text-gray-500 text-xs mt-1">Auction ended with no winner</div>;
    } else if (bid.isHighestBid) {
      return <div className="text-blue-600 text-xs mt-1">Your bid is currently leading</div>;
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-red-700">{error}</div>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Your Bids</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            You haven't placed any bids yet.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6 text-center">
            <p className="text-gray-500 mb-4">Start bidding on products to see your bid history here.</p>
            <Link to="/products">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                Browse Auctions
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Your Bids</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          A history of all bids you've placed
        </p>
      </div>
      <div className="border-t border-gray-200">
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
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bids.map((bid) => (
                <tr key={bid._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {bid.product.images && bid.product.images.length > 0 ? (
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-md object-cover" src={bid.product.images[0].url} alt="" />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md"></div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {bid.product.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {bid.product.status === 'active' 
                            ? `Ends: ${new Date(bid.product.auctionEndTime).toLocaleDateString()}` 
                            : `Ended: ${new Date(bid.product.auctionEndTime).toLocaleDateString()}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatPrice(bid.amount)}</div>
                    {bid.product.currentPrice && (
                      <div className="text-xs text-gray-500">
                        Current price: {formatPrice(bid.product.currentPrice)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(bid.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getBidStatusBadge(bid)}
                    {getStatusInfo(bid)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/products/${bid.product._id}`} className="text-primary-600 hover:text-primary-900">
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