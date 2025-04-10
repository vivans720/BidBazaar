import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import ProductDetail from '../products/ProductDetail';
import { toast } from 'react-toastify';

const VendorDashboard = () => {
  const { state } = useAuth();
  const { user } = state;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchVendorProducts();
  }, []);

  const fetchVendorProducts = async () => {
    try {
      console.log('Fetching vendor products...');
      const res = await api.get('/products/vendor/products');
      console.log('Vendor products response:', res.data);
      setProducts(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching vendor products:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Error fetching products');
      toast.error(err.response?.data?.error || 'Error fetching products');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  // If a product is selected, show its details
  if (selectedProduct) {
    return (
      <ProductDetail
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
      />
    );
  }

  const pendingProducts = products.filter(p => p.status === 'pending');
  const activeProducts = products.filter(p => p.status === 'active');
  // Only count products as completed sales if they have a winner
  const completedSales = products.filter(p => p.winner);
  // Expired auctions are those that have ended but don't have a winner
  const expiredAuctions = products.filter(p => p.status === 'ended' && !p.winner);

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Vendor Dashboard</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Welcome back, {user?.name}!
        </p>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-primary-50 p-6 rounded-lg shadow-sm">
            <h4 className="text-lg font-medium text-primary-800 mb-2">Active Listings</h4>
            <p className="text-3xl font-bold text-primary-600">{activeProducts.length}</p>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-lg shadow-sm">
            <h4 className="text-lg font-medium text-yellow-800 mb-2">Pending Approval</h4>
            <p className="text-3xl font-bold text-yellow-600">{pendingProducts.length}</p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg shadow-sm">
            <h4 className="text-lg font-medium text-green-800 mb-2">Completed Sales</h4>
            <p className="text-3xl font-bold text-green-600">{completedSales.length}</p>
            <p className="text-xs text-green-700 mt-1">Items sold with a winner</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h4 className="text-lg font-medium text-gray-800 mb-2">Expired Auctions</h4>
            <p className="text-3xl font-bold text-gray-600">{expiredAuctions.length}</p>
            <p className="text-xs text-gray-700 mt-1">Ended with no buyers</p>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Your Listings</h4>
            <Link
              to="/products/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Create New Listing
            </Link>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">You haven't created any listings yet</p>
              <Link
                to="/products/create"
                className="mt-4 inline-block text-primary-600 hover:text-primary-500"
              >
                Create your first listing
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Winner
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={product.images?.[0]?.url || '/placeholder-product.png'}
                              alt={product.title}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder-product.png';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <button
                              onClick={() => setSelectedProduct(product)}
                              className="text-sm font-medium text-primary-600 hover:text-primary-900"
                            >
                              {product.title}
                            </button>
                            <div className="text-sm text-gray-500">
                              {product.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${product.status === 'active' ? 'bg-green-100 text-green-800' :
                            product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            product.status === 'ended' && product.winner ? 'bg-blue-100 text-blue-800' :
                            product.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {product.status === 'ended' && product.winner 
                            ? 'Sold' 
                            : product.status === 'ended' 
                              ? 'Expired' 
                              : product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{product.currentPrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(product.endTime).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.winner ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : product.status === 'ended' ? (
                          <span className="text-red-600">No</span>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;