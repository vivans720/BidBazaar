import React, { useState, useEffect } from 'react';
import { getProductBids } from '../../utils/api';
import { toast } from 'react-toastify';

const BidHistory = ({ productId, productStatus, auctionEndTime }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchBids();
    }
  }, [productId]);

  const fetchBids = async () => {
    setLoading(true);
    try {
      const response = await getProductBids(productId);
      setBids(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching bids:', err);
      setError('Failed to load bid history');
      toast.error('Failed to load bid history');
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

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Time since bid was placed
  const getTimeSince = (dateString) => {
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
    }
    return null; // Will use the full date format instead
  };

  // Get bid status indicator
  const getBidStatusIndicator = (bid, index) => {
    if (productStatus === 'sold' && index === 0) {
      return (
        <div className="mt-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full inline-block">
          Winning Bid
        </div>
      );
    } else if (productStatus === 'active' && index === 0) {
      return (
        <div className="mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full inline-block">
          Current Highest
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4">Bid History</h3>
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4">Bid History</h3>
        <div className="bg-red-50 p-3 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4">Bid History</h3>
        <p className="text-gray-500 text-sm">No bids have been placed on this item yet.</p>
      </div>
    );
  }

  // Display initial bids or all bids based on expanded state
  const displayBids = isExpanded ? bids : bids.slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Bid History ({bids.length} bids)</h3>
        {productStatus === 'sold' && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Auction Completed
          </span>
        )}
        {productStatus === 'expired' && (
          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
            Auction Expired
          </span>
        )}
        {auctionEndTime && productStatus === 'active' && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Ends: {new Date(auctionEndTime).toLocaleDateString()}
          </span>
        )}
      </div>
      
      <div className="divide-y divide-gray-200">
        {displayBids.map((bid, index) => (
          <div key={bid._id} className="py-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <span className="font-medium">{bid.bidder.name}</span>
                  <span className={`ml-2 ${index === 0 ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                    {formatPrice(bid.amount)}
                  </span>
                </div>
                {getBidStatusIndicator(bid, index)}
              </div>
              <div className="text-right">
                <span className="text-gray-500 text-sm">
                  {getTimeSince(bid.createdAt) || formatDate(bid.createdAt)}
                </span>
                {bid.bidder.bidCount > 1 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {bid.bidder.bidCount} bids on this item
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {bids.length > 5 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium focus:outline-none"
          >
            {isExpanded ? 'Show Less' : `Show All (${bids.length}) Bids`}
          </button>
        </div>
      )}
    </div>
  );
};

export default BidHistory; 