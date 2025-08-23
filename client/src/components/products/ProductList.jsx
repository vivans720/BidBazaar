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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    sort: 'createdAt',
    page: 1
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

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


  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Auctions</h1>
        <p className="text-gray-600">
          Browse and bid on active auctions
        </p>
      </div>

      {/* Filters */}
      <ProductFilter
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 p-4">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">
            No active auctions found
          </div>
          <p className="text-gray-400 text-sm">
            Check back later for new auctions
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;