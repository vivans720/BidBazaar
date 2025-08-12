import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Package, MessageSquare, Send } from "lucide-react";
import api from "../../utils/api";
import { formatDate, formatCurrency } from "../../utils/format";

const PendingFeedback = () => {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingFor, setSubmittingFor] = useState(null);

  useEffect(() => {
    const fetchPendingReviews = async () => {
      try {
        const response = await api.get("/feedback/pending");
        setPendingReviews(response.data);
      } catch (error) {
        console.error("Failed to fetch pending reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingReviews();
  }, []);

  const handleQuickSubmit = async (productId, rating) => {
    setSubmittingFor(productId);
    try {
      await api.post(`/feedback/product/${productId}/submit`, {
        productRating: rating,
        sellerRating: rating,
        productComment: `Quick ${rating}-star review`,
        sellerComment: `Quick ${rating}-star review`,
      });

      // Remove from pending list
      setPendingReviews((prev) =>
        prev.filter((item) => item.product._id !== productId)
      );
    } catch (error) {
      console.error("Failed to submit quick review:", error);
    } finally {
      setSubmittingFor(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (pendingReviews.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Pending Reviews
        </h3>
        <p className="text-gray-500">
          You're all caught up! Your feedback helps improve the marketplace.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          Pending Reviews ({pendingReviews.length})
        </h2>
        <p className="text-blue-700">
          You have won these auctions. Please share your experience to help
          other buyers.
        </p>
      </div>

      <div className="grid gap-4">
        {pendingReviews.map((item, index) => (
          <motion.div
            key={item.product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Product Image */}
              <div className="flex-shrink-0">
                <img
                  src={item.product.images?.[0] || "/placeholder-product.jpg"}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.product.name}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-1" />
                    <span>Won on {format.formatDate(item.wonDate)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-600">
                      ₹{format.formatPrice(item.winningAmount)}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Seller: {item.product.vendor?.name || "Unknown"}
                </p>

                {/* Quick Rating */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    Quick Rating:
                  </p>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() =>
                          handleQuickSubmit(item.product._id, rating)
                        }
                        disabled={submittingFor === item.product._id}
                        className="group relative p-2 transition-colors hover:bg-yellow-50 rounded"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            submittingFor === item.product._id
                              ? "text-gray-300"
                              : "text-gray-300 group-hover:text-yellow-400"
                          }`}
                        />
                        <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          {rating} star{rating !== 1 ? "s" : ""}
                        </span>
                      </button>
                    ))}
                    {submittingFor === item.product._id && (
                      <div className="ml-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 space-y-2">
                <button
                  onClick={() => {
                    // Navigate to detailed feedback form
                    window.location.href = `/feedback/${item.product._id}`;
                  }}
                  className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Detailed Review</span>
                </button>
                <button
                  onClick={() => {
                    // Mark as remind later (could implement this feature)
                    console.log("Remind later for:", item.product._id);
                  }}
                  className="w-full md:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm"
                >
                  Remind Later
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          💡 <strong>Tip:</strong> Your honest feedback helps other buyers make
          informed decisions and helps sellers improve their service.
        </p>
      </div>
    </div>
  );
};

export default PendingFeedback;
