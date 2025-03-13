import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import ProductCard from './ProductCard';
import ProductFilter from './ProductFilter';

const ProductList = () => {
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
      const queryString = new URLSearchParams({
        category: filters.category,
        sort: filters.sort,
        page: filters.page
      }).toString();

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

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductFilter
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      
      {products.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No products found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;