import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { toast } from "react-toastify";

const RelistModal = ({ product, isOpen, onClose, onRelistSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [priceRecommendation, setPriceRecommendation] = useState(null);
  const [formData, setFormData] = useState({
    startingPrice: "",
    duration: "",
  });

  useEffect(() => {
    if (isOpen && product) {
      fetchPriceRecommendation();
      setFormData({
        startingPrice: "",
        duration: Math.min(Math.max(product.duration || 30, 1), 60),
      });
    }
  }, [isOpen, product]);

  const fetchPriceRecommendation = async () => {
    try {
      const response = await api.get(
        `/products/${product._id}/price-recommendation`
      );
      setPriceRecommendation(response.data.data);
      setFormData((prev) => ({
        ...prev,
        startingPrice: response.data.data.recommendedPrice,
      }));
    } catch (error) {
      console.error("Error fetching price recommendation:", error);
      toast.error("Failed to get price recommendation");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const durationMinutes = parseInt(formData.duration);
    if (isNaN(durationMinutes) || durationMinutes < 1 || durationMinutes > 60) {
      toast.error("Duration must be between 1 and 60 minutes");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(`/products/${product._id}/relist`, {
        startingPrice: parseInt(formData.startingPrice),
        duration: durationMinutes,
      });

      toast.success("Product relisted successfully!");
      onRelistSuccess(response.data.data);
      onClose();
    } catch (error) {
      console.error("Error relisting product:", error);
      toast.error(error.response?.data?.error || "Failed to relist product");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Relist Product
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-900 mb-2">{product.title}</h3>
          <p className="text-sm text-gray-600">
            Original starting price: ₹{product.startingPrice}
          </p>
        </div>

        {priceRecommendation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-900 mb-2">
              💡 Price Recommendation
            </h4>
            <p className="text-sm text-blue-800 mb-2">
              Recommended starting price:{" "}
              <span className="font-semibold">
                ₹{priceRecommendation.recommendedPrice}
              </span>
            </p>
            <p className="text-xs text-blue-700">
              {priceRecommendation.recommendationReason}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Starting Price (₹)
            </label>
            <input
              type="number"
              name="startingPrice"
              value={formData.startingPrice}
              onChange={handleInputChange}
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter starting price"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auction Duration (minutes)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              min="1"
              max="60"
              step="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter duration in minutes (1-60)"
            />
            <p className="mt-1 text-xs text-gray-500">
              Min: 1 minute, Max: 60 minutes
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? "Relisting..." : "Relist Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RelistModal;
