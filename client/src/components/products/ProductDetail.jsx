import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import ImageModal from './ImageModal';

const ProductDetail = ({ product, onApprove, onReject, isAdmin }) => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
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

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Product Details</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Detailed information about the product listing
          </p>
        </div>
        
        <div className="border-t border-gray-200">
          <dl>
            {/* Product Images */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Images</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex space-x-4 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={`Product ${index + 1}`}
                      className="h-32 w-32 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                      onClick={() => handleImageClick(image)}
                    />
                  ))}
                </div>
              </dd>
            </div>

            {/* Basic Info */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Title</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{product.title}</dd>
            </div>

            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Category</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">{product.category}</dd>
            </div>

            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{product.description}</dd>
            </div>

            {/* Pricing Info */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Starting Price</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatPrice(product.startingPrice)}</dd>
            </div>

            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                {auctionStatus === 'ended' ? 'Final Price' : 'Current Price'}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatPrice(product.currentPrice)}</dd>
            </div>

            {/* Auction Info */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Start Time</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {format(new Date(product.startTime), 'PPpp')}
              </dd>
            </div>

            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">End Time</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <span>{format(new Date(product.endTime), 'PPpp')}</span>
                  {auctionStatus === 'active' && (
                    <span className="ml-2 text-sm text-primary-600 font-medium">
                      ({timeLeft})
                    </span>
                  )}
                </div>
              </dd>
            </div>

            {/* Status Info */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 sm:mt-0 sm:col-span-2">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(auctionStatus)}`}>
                  {auctionStatus.charAt(0).toUpperCase() + auctionStatus.slice(1)}
                </span>
              </dd>
            </div>

            {/* Vendor/Seller Info */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                {auctionStatus === 'ended' ? 'Sold By' : 'Vendor'}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {product.vendor.name}
                {product.vendor.email && (
                  <span className="text-gray-500 ml-2">({product.vendor.email})</span>
                )}
              </dd>
            </div>

            {/* Buyer Info (Only for ended auctions with a winner) */}
            {auctionStatus === 'ended' && product.winner && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Bought By</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {product.winner.name}
                  {product.winner.email && (
                    <span className="text-gray-500 ml-2">({product.winner.email})</span>
                  )}
                </dd>
              </div>
            )}

            {/* Auction Result (For ended auctions) */}
            {auctionStatus === 'ended' && (
              <div className={`${product.winner ? 'bg-green-50' : 'bg-yellow-50'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                <dt className="text-sm font-medium text-gray-500">Auction Result</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                  {product.winner ? (
                    <span className="text-green-700">
                      Auction completed successfully. The item was sold for {formatPrice(product.currentPrice)}.
                    </span>
                  ) : (
                    <span className="text-yellow-700">
                      Auction ended with no bids.
                    </span>
                  )}
                </dd>
              </div>
            )}

            {/* Admin Remarks (if any) */}
            {product.adminRemarks && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Admin Remarks</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{product.adminRemarks}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-5 sm:px-6 flex justify-end space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Back
          </button>
          
          {isAdmin && product.status === 'pending' && (
            <>
              <button
                onClick={() => onApprove(product._id)}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Approve
              </button>
              <button
                onClick={handleReject}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          alt="Product"
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
};

export default ProductDetail;