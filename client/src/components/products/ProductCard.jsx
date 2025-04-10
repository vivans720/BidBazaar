import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import ImageModal from './ImageModal';

const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [auctionStatus, setAuctionStatus] = useState(product.status);
  
  // Calculate time remaining and update status if expired
  useEffect(() => {
    const checkAuctionStatus = () => {
      const now = new Date();
      const endTime = new Date(product.endTime);
      
      if (endTime < now && product.status === 'active') {
        setAuctionStatus('ended');
      } else {
        setAuctionStatus(product.status);
      }
    };
    
    checkAuctionStatus();
    
    // Update status every minute
    const intervalId = setInterval(checkAuctionStatus, 60000);
    
    return () => clearInterval(intervalId);
  }, [product.endTime, product.status]);
  
  const timeLeft = formatDistanceToNow(new Date(product.endTime), { addSuffix: true });
  
  const fallbackImage = 'https://via.placeholder.com/400x300?text=No+Image+Available';
  const imageUrl = !imageError && product.images[0]?.url ? product.images[0].url : fallbackImage;

  const handleImageError = () => {
    console.error('Error loading image for product:', product._id);
    setImageError(true);
  };

  const handleImageClick = (e) => {
    e.preventDefault(); // Prevent navigation when clicking the image
    setShowModal(true);
  };

  return (
    <>
      <Link to={`/products/${product._id}`} className="group">
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:transform hover:scale-105">
          <div 
            className="aspect-w-16 aspect-h-9 cursor-pointer"
            onClick={handleImageClick}
          >
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-48 object-cover"
              onError={handleImageError}
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
                <div className="flex flex-col items-end">
                  {auctionStatus === 'active' ? (
                    <p className="text-sm font-medium text-gray-900">
                      Ends {timeLeft}
                    </p>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Auction Ended
                    </span>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    By {product.vendor.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {showModal && (
        <ImageModal
          imageUrl={imageUrl}
          alt={product.title}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default ProductCard;