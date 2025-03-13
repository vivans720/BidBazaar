import React from 'react';

const categories = [
  'all',
  'handicrafts',
  'paintings',
  'decor',
  'jewelry',
  'furniture',
  'other'
];

const sortOptions = [
  { value: 'createdAt', label: 'Latest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'ending-soon', label: 'Ending Soon' }
];

const ProductFilter = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            {categories.map((category) => (
              <option key={category} value={category === 'all' ? '' : category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
            Sort By
          </label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(e) => onFilterChange({ sort: e.target.value })}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;