import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getUserBids } from '../../utils/api';
import ProductCard from './ProductCard';
import ProductFilter from './ProductFilter';

const ProductList = () => {
  const { user } = useAuth().state;
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [expiredAuctions, setExpiredAuctions] = useState([]);
  const [userBids, setUserBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [filters, setFilters] = useState({
    category: '',
    sort: 'createdAt',
    page: 1
  });

  // Get initial tab from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['active', 'expired'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (activeTab === 'active') {
      fetchProducts();
    } else if (activeTab === 'expired') {
      fetchExpiredAuctions();
    }
  }, [filters, activeTab]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryString = new URLSearchParams({
        category: filters.category,
        sort: filters.sort,
        page: filters.page,
        status: 'active'
      }).toString();

      console.log('Fetching products with query:', queryString);
      const res = await api.get(`/products?${queryString}`);
      console.log('Products response:', res.data);
      setProducts(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      const errorMessage = err.response?.data?.error || 'Error fetching products';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const fetchExpiredAuctions = async () => {
    try {
      setLoading(true);
      
      // Fetch user bids first
      const bidsResponse = await getUserBids();
      const bids = bidsResponse.data;
      setUserBids(bids);

      // Fetch expired products
      const queryString = new URLSearchParams({
        category: filters.category,
        sort: filters.sort,
        page: filters.page,
        status: 'ended'
      }).toString();

      const res = await api.get(`/products?${queryString}`);
      const expiredProducts = res.data.data || [];
      
      // Filter to only show expired auctions where user has bids
      const userExpiredAuctions = expiredProducts.filter(product => 
        bids.some(bid => bid.product && bid.product._id === product._id)
      );
      
      setExpiredAuctions(userExpiredAuctions);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching expired auctions:', err);
      const errorMessage = err.response?.data?.error || 'Error fetching expired auctions';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Update URL without page reload
    const params = new URLSearchParams(location.search);
    params.set('tab', tab);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const getUserBidForProduct = (productId) => {
    return userBids.find(bid => bid.product && bid.product._id === productId);
  };

  const isWinner = (product, userBid) => {
    return userBid && product.winner && product.winner._id === user?._id;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const currentProducts = activeTab === 'active' ? products : expiredAuctions;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Auctions</h1>
        <p className="text-gray-600">
          {activeTab === 'active' 
            ? 'Browse and bid on active auctions' 
            : 'View your auction history and results'
          }
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('active')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'active'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Active Auctions
          </button>
          {user && (
            <button
              onClick={() => handleTabChange('expired')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'expired'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Expired Auctions
            </button>
          )}
        </nav>
      </div>

      {/* Filters - Only show for active auctions */}
      {activeTab === 'active' && (
        <ProductFilter
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 p-4">
          {error}
        </div>
      ) : currentProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">
            {activeTab === 'active' 
              ? 'No active auctions found' 
              : 'No auction history found'
            }
          </div>
          <p className="text-gray-400 text-sm">
            {activeTab === 'active' 
              ? 'Check back later for new auctions' 
              : 'Start bidding on active auctions to see your history here'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'active' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {expiredAuctions.map(product => {
                const userBid = getUserBidForProduct(product._id);
                const won = isWinner(product, userBid);
                
                return (
                  <div key={product._id} className="bg-white rounded-lg shadow-md p-6 border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          {product.images && product.images[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {product.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Ended: {new Date(product.endTime).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-600">
                                Final Price: <span className="font-medium text-gray-900">₹{product.currentPrice}</span>
                              </span>
                              {userBid && (
                                <span className="text-gray-600">
                                  Your Bid: <span className="font-medium text-gray-900">₹{userBid.amount}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          won 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {won ? '🎉 Won' : '❌ Lost'}
                        </div>
                        {won && (
                          <div className="mt-2">
                            <button
                              onClick={() => navigate(`/feedback/submit/${product._id}`)}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              Leave Feedback
                            </button>
                          </div>
                        )}
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
  );
};

export default ProductList;