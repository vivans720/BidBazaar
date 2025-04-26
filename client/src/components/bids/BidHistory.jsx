import React, { useState, useEffect } from 'react';
import { getProductBids } from '../../utils/api';
import { toast } from 'react-toastify';
import { 
  ClockIcon,
  ArrowTrendingUpIcon,
  UserIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const BidHistory = ({ productId, productStatus, auctionEndTime }) => {
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchBids();
    }
  }, [productId]);

  const fetchBids = async () => {
    setIsLoading(true);
    try {
      const response = await getProductBids(productId);
      setBids(response.data);
    } catch (error) {
      console.error('Error fetching bids:', error);
      setError('Failed to load bid history. Please try again later.');
      toast.error('Could not load bid history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Calculate time since bid was placed
  const timeAgo = (dateString) => {
    const now = new Date();
    const bidDate = new Date(dateString);
    const seconds = Math.floor((now - bidDate) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
    
    return formatDate(dateString);
  };

  // Get appropriate bid status indicator based on product status
  const getBidStatusIndicator = (bid, index) => {
    if (productStatus === 'sold' && index === 0) {
      return {
        icon: <CheckCircleIcon className="h-4 w-4 text-green-500" />,
        text: 'Winning bid',
        classes: 'bg-green-50 text-green-700 border-green-100'
      };
    } else if (productStatus === 'active' && index === 0) {
      return {
        icon: <ArrowTrendingUpIcon className="h-4 w-4 text-primary-500" />,
        text: 'Highest bid',
        classes: 'bg-primary-50 text-primary-700 border-primary-100'
      };
    }
    return null;
  };

  // Determine how many bids to display
  const displayBids = showAll ? bids : bids.slice(0, 5);
  const hasMoreBids = bids.length > 5;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Bid History</h3>
        <div className="text-sm text-gray-500 flex items-center">
          <span className="px-2 py-1 bg-gray-100 rounded-full">
            {bids.length} {bids.length === 1 ? 'bid' : 'bids'}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse flex space-x-2 items-center">
            <div className="h-3 w-3 bg-primary-400 rounded-full"></div>
            <div className="h-3 w-3 bg-primary-500 rounded-full"></div>
            <div className="h-3 w-3 bg-primary-600 rounded-full"></div>
            <span className="text-sm text-gray-500 ml-2">Loading bid history...</span>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm border border-red-100">
          {error}
        </div>
      ) : bids.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-100">
          <p className="text-gray-500 mb-2">No bids have been placed yet</p>
          <p className="text-sm text-gray-400">Be the first to place a bid on this item!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayBids.map((bid, index) => {
            const statusIndicator = getBidStatusIndicator(bid, index);
            
            return (
              <div 
                key={bid._id} 
                className={`p-4 rounded-lg border ${index === 0 && productStatus !== 'pending' 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-white border-gray-100'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{bid.bidder.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500 flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {timeAgo(bid.createdAt)}
                        </span>
                        
                        {statusIndicator && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center ${statusIndicator.classes}`}>
                            {statusIndicator.icon}
                            <span className="ml-1">{statusIndicator.text}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{formatPrice(bid.amount)}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {index > 0 && (
                        <span className="text-gray-400">
                          {((bid.amount / displayBids[index-1].amount - 1) * 100).toFixed(1)}% lower
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {hasMoreBids && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-2 text-sm text-primary-600 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none transition-colors flex items-center justify-center"
            >
              {showAll ? (
                <>
                  Show less <ChevronUpIcon className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  Show all {bids.length} bids <ChevronDownIcon className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BidHistory; 