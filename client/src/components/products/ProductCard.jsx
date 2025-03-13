import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const ProductCard = ({ product }) => {
  const timeLeft = formatDistanceToNow(new Date(product.endTime), { addSuffix: true });

  return (
    <Link to={`/products/${product._id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:transform hover:scale-105">
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={product.images[0]?.url || 'https://via.placeholder.com/400x300'}
            alt={product.title}
            className="w-full h-48 object-cover"
          />
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
            {product.title}
          </h3>
          
          <p className="mt-1 text-sm text-gray-500">
            {product.description.substring(0, 100)}...
          </p>
          
          <div className="mt-4 flex justify-between items-center">
            <div>
              <p className="text-lg font-bold text-primary-600">
                ₹{product.currentPrice}
              </p>
              <p className="text-sm text-gray-500">
                Starting bid: ₹{product.startingPrice}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                Ends {timeLeft}
              </p>
              <p className="text-sm text-gray-500">
                By {product.vendor.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;