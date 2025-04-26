import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import ProductDetail from '../components/products/ProductDetail';
import BidComponent from '../components/bids/BidComponent';
import BidHistory from '../components/bids/BidHistory';
import { useAuth } from '../context/AuthContext';

// Import these icons if you have Heroicons installed
// If not, you can install with: npm install @heroicons/react/24/outline @heroicons/react/24/solid
import { 
  ArrowLeftIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { state } = useAuth();
  const { user } = state;
  const isAdmin = user?.role === 'admin';
  const isVendor = user?.role === 'vendor';
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  // Function to refresh product after a bid
  const refreshProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.data);
    } catch (err) {
      console.error('Error refreshing product:', err);
    }
  };

  // Calculate time remaining
  useEffect(() => {
    if (product && product.status === 'active') {
      const calculateTimeLeft = () => {
        const now = new Date();
        const endTime = new Date(product.endTime);
        if (endTime > now) {
          const diffInSeconds = Math.floor((endTime - now) / 1000);
          const days = Math.floor(diffInSeconds / 86400);
          const hours = Math.floor((diffInSeconds % 86400) / 3600);
          const minutes = Math.floor((diffInSeconds % 3600) / 60);
          const seconds = diffInSeconds % 60;
          
          let timeString = '';
          if (days > 0) timeString += `${days}d `;
          if (hours > 0 || days > 0) timeString += `${hours}h `;
          if (minutes > 0 || hours > 0 || days > 0) timeString += `${minutes}m `;
          timeString += `${seconds}s`;
          
          setTimeLeft(timeString);
        } else {
          setTimeLeft('Ended');
          // Auto-refresh product if time just expired
          refreshProduct();
        }
      };
      
      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timer);
    }
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        console.log('Product response:', response.data);
        setProduct(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        const errorMessage = err.response?.data?.error || 'Error fetching product details';
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
                <ExclamationTriangleIcon className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Product</h2>
              <p className="text-gray-600 text-center">{error}</p>
              <Link to="/products" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">Home</Link>
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <Link to="/products" className="ml-2 text-gray-500 hover:text-gray-700 text-sm">Products</Link>
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-2 text-gray-900 font-medium text-sm">{product?.title}</span>
            </li>
          </ol>
        </nav>

        {/* Status Banner for Active Products */}
        {product && product.status === 'active' && (
          <div className="mb-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-md p-4 text-white">
            <div className="flex items-center justify-between flex-wrap">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">Auction ending in:</span>
                <span className="ml-2 font-bold tabular-nums">{timeLeft}</span>
              </div>
              <div className="flex items-center mt-2 sm:mt-0">
                <span className="mr-2">Current Bid:</span>
                <span className="font-bold text-lg">{formatPrice(product.currentPrice)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Details - 2/3 width on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {product && <ProductDetail product={product} />}
            </div>
          </div>
          
          {/* Bidding Sidebar - 1/3 width on large screens */}
          <div className="lg:col-span-1 space-y-6">
            {/* Sticky container for bid form on desktop */}
            <div className="lg:sticky lg:top-6">
              {/* Bid Form */}
              {product && product.status === 'active' && !isAdmin && !isVendor && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <BidComponent 
                    productId={product._id} 
                    currentPrice={product.currentPrice}
                    startingPrice={product.startingPrice} 
                    refreshProduct={refreshProduct}
                  />
                </div>
              )}
              
              {/* Admin Cannot Bid Message */}
              {product && product.status === 'active' && isAdmin && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Administrator Access</h3>
                  <div className="bg-purple-50 rounded-lg p-4 flex">
                    <ShieldExclamationIcon className="h-5 w-5 text-purple-400 mr-2 flex-shrink-0" />
                    <p className="text-purple-700 text-sm">
                      As an administrator, you can view but cannot place bids on auctions. This ensures fairness and transparency in the bidding process.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Vendor Cannot Bid Message */}
              {product && product.status === 'active' && isVendor && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Vendor Access</h3>
                  <div className="bg-orange-50 rounded-lg p-4 flex">
                    <ShieldExclamationIcon className="h-5 w-5 text-orange-400 mr-2 flex-shrink-0" />
                    <p className="text-orange-700 text-sm">
                      As a vendor, you can view but cannot place bids on auctions. This ensures fair competition and prevents conflicts of interest.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Unavailable Bidding Message */}
              {product && product.status !== 'active' && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Bidding Unavailable</h3>
                  {product.status === 'pending' && (
                    <div className="bg-yellow-50 rounded-lg p-4 flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                      <p className="text-yellow-700 text-sm">
                        This auction is pending approval and not yet active for bidding.
                      </p>
                    </div>
                  )}
                  {product.status === 'rejected' && (
                    <div className="bg-red-50 rounded-lg p-4 flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                      <p className="text-red-700 text-sm">
                        This auction has been rejected and is not available for bidding.
                      </p>
                    </div>
                  )}
                  {product.status === 'ended' && (
                    <div className="bg-blue-50 rounded-lg p-4 flex">
                      <ClockIcon className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-blue-700 text-sm font-medium">
                          This auction has ended.
                        </p>
                        <p className="text-blue-600 text-sm mt-1">
                          {product.winner 
                            ? `Winning bid: ${formatPrice(product.currentPrice)}`
                            : 'No bids were placed on this item.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Bid History */}
              {product && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6">
                  <BidHistory 
                    productId={product._id}
                    productStatus={product.status}
                    auctionEndTime={product.endTime}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 