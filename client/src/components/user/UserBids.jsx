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
    try {
      setLoading(true);
      const response = await getUserBids();
      console.log('User bids:', response.data);
      setBids(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user bids:', err);
      const errorMessage = err.response?.data?.error || 'Error fetching your bids';
      setError(errorMessage);
      toast.error(errorMessage);
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

  // Get badge color based on bid status
  const getBadgeColor = (status) => {
    switch (status) {
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      case 'active':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  // Get status display text with proper capitalization
  const getStatusDisplay = (bid) => {
    if (bid.status === 'won') {
      return 'Won';
    } else if (bid.status === 'lost') {
      return 'Outbid';
    } else if (bid.status === 'active') {
      // Check if it's the highest bid
      const isHighestBid = bid.product?.currentPrice === bid.amount;
      return isHighestBid ? 'Highest Bid' : 'Active';
    }
    return bid.status.charAt(0).toUpperCase() + bid.status.slice(1);
  };
  
  // Get additional status information
  const getStatusInfo = (bid) => {
    if (bid.status === 'won') {
      return <div className="text-green-600 text-xs mt-1">You won this auction!</div>;
    } else if (bid.status === 'lost' && bid.product?.status === 'ended') {
      const winningAmount = bid.product.currentPrice || bid.product.startingPrice;
      return <div className="text-gray-500 text-xs mt-1">Sold for {formatPrice(winningAmount || 0)}</div>;
    } else if (bid.product?.status === 'expired') {
      return <div className="text-gray-500 text-xs mt-1">Auction ended with no winner</div>;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700">
        {error}
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Your Bids</h2>
        <div className="bg-gray-50 p-4 rounded-md text-gray-600 text-center">
          You haven't placed any bids yet.
          <div className="mt-2">
            <Link to="/products" className="text-primary-600 hover:text-primary-800">
              Browse available auctions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Your Bids</h2>
      
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
                    <div className="h-10 w-10 flex-shrink-0">
                      {bid.product?.images?.[0]?.url ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={bid.product.images[0].url}
                          alt={bid.product.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No img</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <Link 
                        to={`/products/${bid.product?._id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-900"
                      >
                        {bid.product?.name || 'Unknown Product'}
                      </Link>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatPrice(bid.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(bid.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(bid.createdAt).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeColor(bid.status)}`}>
                    {getStatusDisplay(bid)}
                  </span>
                  {getStatusInfo(bid)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link 
                    to={`/products/${bid.product?._id}`}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    View Product
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserBids; 