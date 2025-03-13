import React from 'react';

const ImageModal = ({ imageUrl, alt, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="relative max-w-4xl w-full">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 text-xl font-bold p-2"
        >
          ✕ Close
        </button>
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
        />
      </div>
    </div>
  );
};

export default ImageModal; 