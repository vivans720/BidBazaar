import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import ProductDetail from '../components/products/ProductDetail';
import BidComponent from '../components/bids/BidComponent';
import BidHistory from '../components/bids/BidHistory';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to refresh product after a bid
  const refreshProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.data);
    } catch (err) {
      console.error('Error refreshing product:', err);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        console.log('Product response:', response.data);
        setProduct(response.data.data); // Access the nested data property
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600 p-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {product && <ProductDetail product={product} />}
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          {product && product.status === 'active' && (
            <BidComponent 
              productId={product._id} 
              currentPrice={product.currentPrice}
              startingPrice={product.startingPrice} 
              refreshProduct={refreshProduct}
            />
          )}
          
          {product && product.status !== 'active' && (
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Bidding Unavailable</h3>
              <p className="text-gray-600">
                {product.status === 'pending' 
                  ? 'This auction is pending approval and not yet active for bidding.'
                  : product.status === 'rejected'
                  ? 'This auction has been rejected and is not available for bidding.'
                  : 'This auction has ended and is no longer accepting bids.'}
              </p>
            </div>
          )}
          
          {/* Add Bid History component */}
          {product && <BidHistory productId={product._id} />}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 