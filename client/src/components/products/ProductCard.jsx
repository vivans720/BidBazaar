import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import ImageModal from './ImageModal';

const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [auctionStatus, setAuctionStatus] = useState(product.status);
  const [timeLeft, setTimeLeft] = useState('');
  
  // Calculate time remaining and update status if expired
  useEffect(() => {
    const updateTimeAndStatus = () => {
      const now = new Date();
      const endTime = new Date(product.endTime);
      
      if (endTime < now && product.status === 'active') {
        setAuctionStatus('ended');
        setTimeLeft('Auction ended');
      } else {
        setAuctionStatus(product.status);
        if (product.status === 'active') {
          setTimeLeft(formatDistanceToNow(endTime, { addSuffix: true }));
        }
      }
    };
    
    updateTimeAndStatus();
    
    // Update every second for real-time countdown
    const intervalId = setInterval(updateTimeAndStatus, 1000);
    
    return () => clearInterval(intervalId);
  }, [product.endTime, product.status]);
  
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

  // Format price with commas
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <div className="h-full group">
        <div className="relative bg-white h-full rounded-xl shadow-sm hover:shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col">
          {/* Status badge - top left */}
          {auctionStatus !== 'active' && (
            <div className="absolute top-3 left-3 z-10">
              {auctionStatus === 'ended' ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
                  Ended
                </span>
              ) : auctionStatus === 'pending' ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                  Pending
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-1.5"></span>
                  {auctionStatus.charAt(0).toUpperCase() + auctionStatus.slice(1)}
                </span>
              )}
            </div>
          )}
          
          {/* Image container */}
          <div 
            className="relative aspect-w-16 aspect-h-9 cursor-pointer overflow-hidden bg-gray-100"
            onClick={handleImageClick}
          >
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
            />
            {auctionStatus === 'active' && (
              <div className="absolute top-3 right-3">
                <div className="bg-green-100 text-green-800 border border-green-200 text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Live Auction
                </div>
              </div>
            )}
          </div>
          
          {/* Content container */}
          <div className="p-5 flex flex-col flex-grow">
            <Link to={`/products/${product._id}`}>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors duration-200">
                {product.title}
              </h3>
            </Link>
            
            <p className="mt-2 text-sm text-gray-600 line-clamp-2 flex-grow">
              {product.description.substring(0, 100)}...
            </p>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-base text-gray-500 mb-1">Current Bid</p>
                  <p className="text-xl font-bold text-primary-600">
                    {formatPrice(product.currentPrice)}
                  </p>
                </div>
                
                <div className="text-right">
                  {auctionStatus === 'active' ? (
                    <div className="bg-primary-50 border border-primary-100 rounded-lg px-3 py-1.5">
                      <p className="text-sm font-medium text-primary-700 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {timeLeft}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
              
              <div className="mt-3 flex items-center">
                <div className="flex-shrink-0">
                  <div className="inline-flex h-8 w-8 rounded-full bg-primary-100 text-primary-600 items-center justify-center">
                    {product.vendor.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-2">
                  <p className="text-sm text-gray-500">
                    {product.vendor.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="px-5 pb-5 mt-auto">
            <Link 
              to={`/products/${product._id}`} 
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              {auctionStatus === 'active' ? 'Place Bid' : 'View Details'}
            </Link>
          </div>
        </div>
      </div>

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