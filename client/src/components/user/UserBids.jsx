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
  ExclamationTriangleIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  FunnelIcon
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
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'won', 'lost'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'amount'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

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

  // Get background color based on bid status
  const getStatusBgColor = (status) => {
    switch (status) {
      case 'won':
        return 'bg-green-50 border-green-100';
      case 'lost':
        return 'bg-red-50 border-red-100';
      case 'active':
      default:
        return 'bg-blue-50 border-blue-100';
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

  // Filter and sort bids
  const getFilteredAndSortedBids = () => {
    let filteredBids = [...bids];
    
    // Apply filter
    if (filter !== 'all') {
      filteredBids = filteredBids.filter(bid => bid.status === filter);
    }
    
    // Apply sorting
    filteredBids.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'amount') {
        return sortOrder === 'desc' 
          ? b.amount - a.amount
          : a.amount - b.amount;
      }
      return 0;
    });
    
    return filteredBids;
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchUserBids();
    toast.info("Refreshing your bids...");
  };

  const filteredBids = getFilteredAndSortedBids();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading your bids...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-red-700 border border-red-200">
        <div className="flex items-center mb-3">
          <ExclamationTriangleIcon className="h-6 w-6 mr-2 text-red-500" />
          <h3 className="text-lg font-medium text-red-800">Error Loading Bids</h3>
        </div>
        <p>{error}</p>
        <button 
          onClick={handleRefresh}
          className="mt-4 inline-flex items-center px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-md"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Bids</h2>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8 text-center">
          <div className="mx-auto w-20 h-20 mb-4 text-gray-300">
            <GlobeAsiaAustraliaIcon className="h-full w-full" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bids Yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            You haven't placed any bids yet. Start bidding on items to see your bid history here.
          </p>
          <Link to="/products" className="inline-flex items-center px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors">
            Browse Auctions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Bids</h2>
          <p className="text-gray-500 mt-1">
            Track and manage all your auction bids in one place
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh} 
            className="inline-flex items-center px-3 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-md shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1.5" />
            Refresh
          </button>
          
          <Link 
            to="/products" 
            className="inline-flex items-center px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1.5" />
            Browse Auctions
          </Link>
        </div>
      </div>

      {/* Bid Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <ClockIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Bids</p>
              <p className="text-xl font-bold text-gray-900">{stats.activeBids}</p>
            </div>
          </div>
          <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full" 
              style={{width: `${stats.totalBids ? (stats.activeBids / stats.totalBids) * 100 : 0}%`}}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <TrophyIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Won Auctions</p>
              <p className="text-xl font-bold text-gray-900">{stats.wonBids}</p>
            </div>
          </div>
          <div className="h-2 bg-green-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full" 
              style={{width: `${stats.totalBids ? (stats.wonBids / stats.totalBids) * 100 : 0}%`}}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Lost Bids</p>
              <p className="text-xl font-bold text-gray-900">{stats.lostBids}</p>
            </div>
          </div>
          <div className="h-2 bg-red-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 rounded-full" 
              style={{width: `${stats.totalBids ? (stats.lostBids / stats.totalBids) * 100 : 0}%`}}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
              <CurrencyRupeeIcon className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Highest Bid</p>
              <p className="text-xl font-bold text-gray-900">{formatPrice(stats.highestBid)}</p>
            </div>
          </div>
          <div className="h-2 bg-primary-100 rounded-full">
            <div className="h-full bg-primary-500 rounded-full w-full"></div>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          <div className="flex gap-1">
            <button 
              onClick={() => setFilter('all')} 
              className={`px-3 py-1.5 text-sm rounded-md ${filter === 'all' ? 'bg-primary-100 text-primary-700 font-medium' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('active')} 
              className={`px-3 py-1.5 text-sm rounded-md ${filter === 'active' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              Active
            </button>
            <button 
              onClick={() => setFilter('won')} 
              className={`px-3 py-1.5 text-sm rounded-md ${filter === 'won' ? 'bg-green-100 text-green-700 font-medium' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              Won
            </button>
            <button 
              onClick={() => setFilter('lost')} 
              className={`px-3 py-1.5 text-sm rounded-md ${filter === 'lost' ? 'bg-red-100 text-red-700 font-medium' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              Lost
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select 
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            className="px-3 py-1.5 text-sm rounded-md bg-white text-gray-700 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="amount-desc">Amount (Highest)</option>
            <option value="amount-asc">Amount (Lowest)</option>
          </select>
        </div>
      </div>

      {/* Bid List */}
      {filteredBids.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 text-center">
          <p className="text-gray-500">No bids found with the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBids.map((bid) => (
            <div 
              key={bid._id} 
              className={`bg-white rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 ${getStatusBgColor(bid.status)}`}
            >
              <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start">
                    <div className="h-16 w-16 flex-shrink-0 mr-4 rounded-md overflow-hidden bg-gray-100">
                      {bid.product?.images?.[0]?.url ? (
                        <img
                          className="h-full w-full object-cover"
                          src={bid.product.images[0].url}
                          alt={bid.product.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-500 text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Link
                        to={`/products/${bid.product?._id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-primary-600 line-clamp-1 transition-colors"
                      >
                        {bid.product?.name || 'Unknown Product'}
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span>{formatDate(bid.createdAt)}</span>
                        </div>
                        
                        <div className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full ${getBadgeColor(bid.status)}`}>
                          {getStatusIcon(bid)}
                          <span className="ml-1">{getStatusDisplay(bid)}</span>
                        </div>
                      </div>
                      {getStatusInfo(bid)}
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Your bid</p>
                      <p className="text-xl font-bold text-gray-900">{formatPrice(bid.amount)}</p>
                    </div>
                    
                    <Link
                      to={`/products/${bid.product?._id}`}
                      className="mt-3 inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 text-primary-600 text-sm font-medium rounded-md hover:bg-primary-50 transition-colors"
                    >
                      View Product
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Summary Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        Showing {filteredBids.length} of {stats.totalBids} bids
        {filter !== 'all' ? ` (filtered by ${filter})` : ''}
      </div>
    </div>
  );
};

export default UserBids; 