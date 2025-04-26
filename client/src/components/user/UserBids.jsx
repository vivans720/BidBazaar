import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserBids } from '../../utils/api';
import { toast } from 'react-toastify';
import { 
  ArrowTopRightOnSquareIcon,
  GlobeAsiaAustraliaIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  TrophyIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const UserBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalBids: 0,
    activeBids: 0,
    wonBids: 0,
    lostBids: 0,
    highestBid: 0
  });

  useEffect(() => {
    fetchUserBids();
  }, []);

  const fetchUserBids = async () => {
    try {
      setLoading(true);
      const response = await getUserBids();
      console.log('User bids:', response.data);
      setBids(response.data);
      
      // Calculate stats
      if (response.data.length > 0) {
        const activeBids = response.data.filter(b => b.status === 'active').length;
        const wonBids = response.data.filter(b => b.status === 'won').length;
        const lostBids = response.data.filter(b => b.status === 'lost').length;
        const highestBid = Math.max(...response.data.map(b => b.amount));
        
        setStats({
          totalBids: response.data.length,
          activeBids,
          wonBids,
          lostBids,
          highestBid
        });
      }
      
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
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'lost':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'active':
      default:
        return 'bg-blue-100 text-blue-800 border border-blue-200';
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
  
  // Get status icon
  const getStatusIcon = (bid) => {
    if (bid.status === 'won') {
      return <TrophyIcon className="h-4 w-4" />;
    } else if (bid.status === 'lost') {
      return <ExclamationTriangleIcon className="h-4 w-4" />;
    } else {
      const isHighestBid = bid.product?.currentPrice === bid.amount;
      return isHighestBid ? <CurrencyRupeeIcon className="h-4 w-4" /> : <ClockIcon className="h-4 w-4" />;
    }
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

  // Format date in a readable way with relative time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return diffDays + ' days ago';
    } else {
      return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
    }
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
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Your Bids</h3>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 mb-4 text-gray-300">
            <GlobeAsiaAustraliaIcon className="h-full w-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Bids Yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            You haven't placed any bids yet. Start bidding on items to see your bid history here.
          </p>
          <Link to="/products" className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors">
            Browse Auctions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Your Bids</h3>
        <span className="text-gray-500 text-sm">
          {stats.totalBids} {stats.totalBids === 1 ? 'bid' : 'bids'} total
        </span>
      </div>
      
      {/* Bid Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
          <div className="flex items-center mb-2">
            <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center mr-3">
              <ClockIcon className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-gray-700 font-medium">Active Bids</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.activeBids}</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
          <div className="flex items-center mb-2">
            <div className="h-8 w-8 rounded-md bg-green-100 flex items-center justify-center mr-3">
              <TrophyIcon className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-gray-700 font-medium">Won Auctions</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.wonBids}</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
          <div className="flex items-center mb-2">
            <div className="h-8 w-8 rounded-md bg-red-100 flex items-center justify-center mr-3">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            </div>
            <span className="text-gray-700 font-medium">Lost Bids</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.lostBids}</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
          <div className="flex items-center mb-2">
            <div className="h-8 w-8 rounded-md bg-primary-100 flex items-center justify-center mr-3">
              <CurrencyRupeeIcon className="h-4 w-4 text-primary-600" />
            </div>
            <span className="text-gray-700 font-medium">Highest Bid</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.highestBid)}</p>
        </div>
      </div>
      
      {/* Bid List */}
      <div className="space-y-4">
        {bids.map((bid) => (
          <div key={bid._id} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="h-12 w-12 flex-shrink-0 mr-4">
                    {bid.product?.images?.[0]?.url ? (
                      <img
                        className="h-12 w-12 rounded-lg object-cover"
                        src={bid.product.images[0].url}
                        alt={bid.product.name}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No img</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Link 
                      to={`/products/${bid.product?._id}`}
                      className="text-base font-medium text-gray-900 hover:text-primary-600 line-clamp-1"
                    >
                      {bid.product?.name || 'Unknown Product'}
                    </Link>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <ClockIcon className="h-3.5 w-3.5 mr-1" />
                      <span>{formatDate(bid.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <div className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full ${getBadgeColor(bid.status)}`}>
                    {getStatusIcon(bid)}
                    <span className="ml-1">{getStatusDisplay(bid)}</span>
                  </div>
                  {getStatusInfo(bid)}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-gray-500 text-xs">Your bid</p>
                  <p className="text-lg font-bold text-gray-900">{formatPrice(bid.amount)}</p>
                </div>
                
                <Link 
                  to={`/products/${bid.product?._id}`}
                  className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-800"
                >
                  View Details
                  <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserBids; 