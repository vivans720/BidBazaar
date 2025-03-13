import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import ImageModal from './ImageModal';

const ProductDetail = ({ product, onApprove, onReject, isAdmin }) => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);

  const handleReject = () => {
    const remarks = prompt('Enter rejection remarks:');
    if (remarks !== null) {
      onReject(product._id, remarks);
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
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
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${product.startingPrice}</dd>
            </div>

            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Current Price</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${product.currentPrice}</dd>
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
                {format(new Date(product.endTime), 'PPpp')}
              </dd>
            </div>

            {/* Status Info */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 sm:mt-0 sm:col-span-2">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${product.status === 'active' ? 'bg-green-100 text-green-800' : 
                    product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    product.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </span>
              </dd>
            </div>

            {/* Vendor Info */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Vendor</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{product.vendor.name}</dd>
            </div>

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