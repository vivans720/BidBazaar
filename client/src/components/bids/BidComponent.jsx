import React, { useState, useEffect } from 'react';
import { placeBid, getProductBids } from '../../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const BidComponent = ({ productId, currentPrice, refreshProduct, startingPrice }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBids, setIsLoadingBids] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [validBidAmounts, setValidBidAmounts] = useState([]);
  const { state, user, isAuthenticated } = useAuth();

  // Format price function
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Fetch bids on component mount and when productId changes
  useEffect(() => {
    if (productId) {
      fetchBids();
    }
  }, [productId]);

  // Calculate valid bid amounts based on 5% increments from starting price
  useEffect(() => {
    if (startingPrice) {
      const increment = Math.ceil(startingPrice * 0.05);
      const amounts = [];
      let value = startingPrice;
      
      // Generate valid bid amounts up to a reasonable limit (e.g., 10 steps above current price)
      for (let i = 0; i < 20; i++) {
        value += increment;
        amounts.push(value);
        if (value >= currentPrice * 2) break; // Don't go too far beyond current price
      }
      
      setValidBidAmounts(amounts);
    }
  }, [startingPrice, currentPrice]);

  // Log authentication state on mount and when it changes
  useEffect(() => {
    console.log('BidComponent - Auth State:', { 
      isAuthenticated, 
      user: user ? `${user.name} (${user.role})` : 'No user',
      token: state.token ? 'Token exists' : 'No token'
    });
  }, [isAuthenticated, user, state.token]);

  // Function to fetch bids
  const fetchBids = async () => {
    setIsLoadingBids(true);
    try {
      const response = await getProductBids(productId);
      setBids(response.data);
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setIsLoadingBids(false);
    }
  };

  // Get next valid bid amount
  const getNextValidBidAmount = () => {
    // Find the first valid bid amount that is higher than the current price
    return validBidAmounts.find(amount => amount > currentPrice) || 
      (currentPrice + Math.ceil(startingPrice * 0.05));
  };

  // Handle bid submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorDetails(null);
    
    if (!isAuthenticated) {
      const errorMsg = 'Please log in to place a bid';
      setErrorDetails({
        message: errorMsg,
        authState: {
          isAuthenticated,
          hasToken: Boolean(state.token),
          hasUser: Boolean(user),
          userRole: user?.role || 'unknown'
        }
      });
      toast.error(errorMsg);
      return;
    }
    
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    const nextValidBid = getNextValidBidAmount();
    
    // Check if bid amount is a valid increment
    if (validBidAmounts.length > 0 && !validBidAmounts.includes(parseFloat(bidAmount))) {
      toast.error(`Please bid at a valid 5% increment from the base price. Next valid amount: ${formatPrice(nextValidBid)}`);
      return;
    }
    
    if (parseFloat(bidAmount) <= currentPrice) {
      toast.error(`Bid amount must be higher than current price (${formatPrice(currentPrice)})`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await placeBid(productId, parseFloat(bidAmount));
      console.log('Bid placed successfully:', response);
      toast.success('Bid placed successfully!');
      setBidAmount('');
      fetchBids(); // Refresh bids list
      if (refreshProduct) refreshProduct(); // Refresh product details if callback provided
    } catch (error) {
      console.error('Error placing bid:', error);
      const errorMsg = error.response?.data?.error || 'Failed to place bid';
      const statusCode = error.response?.status;
      
      setErrorDetails({
        message: errorMsg,
        status: statusCode,
        authState: {
          isAuthenticated,
          hasToken: Boolean(state.token),
          hasUser: Boolean(user),
          userRole: user?.role || 'unknown'
        }
      });
      
      if (statusCode === 401) {
        toast.error('Authentication error. Please try logging in again.');
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum next valid bid
  const minimumBid = getNextValidBidAmount();

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Place Your Bid</h3>
      
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Bid Amount (₹)
            </label>
            <div className="flex space-x-2">
              <select
                id="bidAmount"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select a bid amount</option>
                {validBidAmounts
                  .filter(amount => amount > currentPrice)
                  .slice(0, 10) // Limit to 10 options
                  .map((amount, index) => (
                    <option key={index} value={amount}>
                      {formatPrice(amount)}
                    </option>
                  ))
                }
              </select>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Bidding...' : 'Place Bid'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Current Highest: {formatPrice(currentPrice)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Next Valid Bid: {formatPrice(minimumBid)} (5% increments from base price)
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Base price: {formatPrice(startingPrice)} • Increment: {formatPrice(Math.ceil(startingPrice * 0.05))}
            </p>
            
            {/* Show user role for debugging */}
            <p className="text-xs text-green-600 mt-1">
              Logged in as: {user?.name} ({user?.role})
            </p>
          </div>
        </form>
      ) : (
        <div className="bg-yellow-50 p-3 rounded-md">
          <p className="text-yellow-700">Please <Link to="/login" className="font-medium text-yellow-800 underline">log in</Link> to place a bid on this product.</p>
        </div>
      )}
      
      {errorDetails && (
        <div className="mt-3 p-3 bg-red-50 rounded-md">
          <h5 className="font-medium text-red-800">Error Details</h5>
          <p className="text-sm text-red-700">{errorDetails.message}</p>
          {errorDetails.status && (
            <p className="text-xs text-red-600">Status Code: {errorDetails.status}</p>
          )}
          <p className="text-xs text-red-600 mt-1">
            Auth State: {errorDetails.authState.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}, 
            Token: {errorDetails.authState.hasToken ? 'Present' : 'Missing'}, 
            Role: {errorDetails.authState.userRole}
          </p>
          <div className="mt-2">
            <Link to="/debug" className="text-xs text-blue-600 underline">
              Debug Authentication
            </Link>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h4 className="text-md font-medium mb-2">Recent Bids</h4>
        {isLoadingBids ? (
          <p className="text-gray-500 text-sm">Loading bids...</p>
        ) : bids.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {bids.slice(0, 5).map((bid, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div className="text-sm">
                  <span className="font-medium">{bid.bidder.name}</span>
                  <span className="text-gray-500 text-xs ml-2">
                    {new Date(bid.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="font-semibold">{formatPrice(bid.amount)}</div>
              </div>
            ))}
            {bids.length > 5 && (
              <p className="text-sm text-gray-500 text-center">
                + {bids.length - 5} more bids
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No bids yet. Be the first to bid!</p>
        )}
      </div>
    </div>
  );
};

export default BidComponent; 