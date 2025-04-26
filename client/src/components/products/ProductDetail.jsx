import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import ImageModal from './ImageModal';

// Import icons (if not already imported)
import { 
  ClockIcon, 
  TagIcon, 
  CurrencyRupeeIcon, 
  UserIcon, 
  CheckBadgeIcon,
  CalendarIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const ProductDetail = ({ product, onApprove, onReject, isAdmin }) => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [auctionStatus, setAuctionStatus] = useState(product.status);
  const [timeLeft, setTimeLeft] = useState('');
  
  // Check and update auction status
  useEffect(() => {
    const checkAuctionStatus = () => {
      const now = new Date();
      const endTime = new Date(product.endTime);
      
      if (endTime < now && product.status === 'active') {
        setAuctionStatus('ended');
      } else {
        setAuctionStatus(product.status);
      }
      
      // Calculate time remaining
      if (endTime > now) {
        setTimeLeft(formatDistanceToNow(endTime, { addSuffix: true }));
      } else {
        setTimeLeft('Ended');
      }
    };
    
    checkAuctionStatus();
    
    // Update status every minute
    const intervalId = setInterval(checkAuctionStatus, 60000);
    
    return () => clearInterval(intervalId);
  }, [product.endTime, product.status]);

  const handleReject = () => {
    const remarks = prompt('Enter rejection remarks:');
    if (remarks !== null) {
      onReject(product._id, remarks);
    }
  };

  const handleImageClick = (image, index) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const nextImage = () => {
    if (product.images.length > 1) {
      const newIndex = (currentImageIndex + 1) % product.images.length;
      setCurrentImageIndex(newIndex);
    }
  };

  const prevImage = () => {
    if (product.images.length > 1) {
      const newIndex = (currentImageIndex - 1 + product.images.length) % product.images.length;
      setCurrentImageIndex(newIndex);
    }
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'ended':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="overflow-hidden">
      {/* Product Header */}
      <div className="px-6 py-6 bg-white">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`px-3 py-1 inline-flex text-sm font-medium rounded-full ${getStatusBadgeClasses(auctionStatus)}`}>
            {auctionStatus.charAt(0).toUpperCase() + auctionStatus.slice(1)}
          </span>
          <span className="text-gray-500 text-sm">
            <span className="inline-flex items-center">
              <UserIcon className="h-4 w-4 mr-1" />
              Sold by {product.vendor.name}
            </span>
          </span>
          <span className="text-gray-500 text-sm">
            <span className="inline-flex items-center">
              <TagIcon className="h-4 w-4 mr-1" />
              <span className="capitalize">{product.category}</span>
            </span>
          </span>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2 p-6">
          <div className="relative aspect-w-1 aspect-h-1 bg-gray-100 rounded-xl overflow-hidden mb-4">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[currentImageIndex].url}
                alt={`${product.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}

            {/* Navigation Arrows (if multiple images) */}
            {product.images && product.images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md text-gray-800 hover:bg-white focus:outline-none"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md text-gray-800 hover:bg-white focus:outline-none"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Click to enlarge */}
            <button
              onClick={() => product.images && product.images.length > 0 && handleImageClick(product.images[currentImageIndex], currentImageIndex)}
              className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full hover:bg-black/80 focus:outline-none"
            >
              Click to enlarge
            </button>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex ? 'border-primary-500' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="md:w-1/2 p-6 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100">
          {/* Pricing Section */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="mb-4">
              <h2 className="text-sm font-medium text-gray-500 mb-1">Starting Price</h2>
              <div className="text-2xl font-bold text-gray-900 flex items-center">
                <CurrencyRupeeIcon className="h-5 w-5 text-gray-500 mr-1" />
                {formatPrice(product.startingPrice).replace('₹', '')}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-1">
                {auctionStatus === 'ended' ? 'Final Price' : 'Current Bid'}
              </h2>
              <div className="text-3xl font-bold text-primary-600 flex items-center">
                <CurrencyRupeeIcon className="h-6 w-6 text-primary-500 mr-1" />
                {formatPrice(product.currentPrice).replace('₹', '')}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
          </div>

          {/* Auction Details */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Auction Details</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <span className="block text-sm font-medium text-gray-500">Start Time</span>
                  <span className="block text-gray-900">
                    {format(new Date(product.startTime), 'PPpp')}
                  </span>
                </div>
              </li>
              <li className="flex items-start">
                <ClockIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <span className="block text-sm font-medium text-gray-500">End Time</span>
                  <span className="block text-gray-900">
                    {format(new Date(product.endTime), 'PPpp')}
                  </span>
                  {auctionStatus === 'active' && (
                    <span className="block mt-1 text-sm text-primary-600 font-medium">
                      ({timeLeft})
                    </span>
                  )}
                </div>
              </li>
            </ul>
          </div>

          {/* Auction Result (For ended auctions) */}
          {auctionStatus === 'ended' && (
            <div className={`p-4 rounded-lg ${product.winner ? 'bg-green-50 border border-green-100' : 'bg-yellow-50 border border-yellow-100'} mb-6`}>
              <h2 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                {product.winner 
                  ? <><CheckBadgeIcon className="h-5 w-5 text-green-500 mr-1" /> Auction Completed</>
                  : <><InformationCircleIcon className="h-5 w-5 text-yellow-500 mr-1" /> Auction Ended</>
                }
              </h2>
              <p className={product.winner ? 'text-green-700' : 'text-yellow-700'}>
                {product.winner 
                  ? `This auction completed successfully. The item was sold for ${formatPrice(product.currentPrice)}.`
                  : 'This auction ended with no bids.'
                }
              </p>
              
              {/* Winner Information */}
              {product.winner && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <span className="block text-sm font-medium text-gray-700">Winning Bidder:</span>
                  <div className="flex items-center mt-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                      <span className="text-green-700 font-medium">
                        {product.winner.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span>{product.winner.name}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Admin Remarks (if any) */}
          {product.adminRemarks && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-1">Admin Remarks</h3>
              <p className="text-yellow-700 text-sm">{product.adminRemarks}</p>
            </div>
          )}

          {/* Admin Actions */}
          {isAdmin && product.status === 'pending' && (
            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => onApprove(product._id)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium"
              >
                Approve Auction
              </button>
              <button
                onClick={handleReject}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md font-medium"
              >
                Reject
              </button>
            </div>
          )}

          {/* Back Button (only shown on mobile) */}
          <button
            onClick={() => navigate(-1)}
            className="md:hidden mt-6 w-full flex justify-center items-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Back
          </button>
        </div>
      </div>

      {/* Admin Action Buttons in desktop */}
      {(isAdmin || onApprove || onReject) && (
        <div className="hidden md:flex px-6 py-4 border-t border-gray-200 justify-end space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back
          </button>
          
          {isAdmin && product.status === 'pending' && (
            <>
              <button
                onClick={() => onApprove(product._id)}
                className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={handleReject}
                className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Reject
              </button>
            </>
          )}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          alt="Product"
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default ProductDetail;