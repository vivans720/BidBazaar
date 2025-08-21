import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, MessageSquare, Send } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { formatDate, formatCurrency } from "../../utils/format";

const PendingFeedback = () => {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingFor, setSubmittingFor] = useState(null);

  useEffect(() => {
    const fetchPendingReviews = async () => {
      try {
        const response = await api.get("/feedback/my/pending");
        setPendingReviews(response.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch pending reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingReviews();
  }, []);

  // Quick submit has been removed to ensure proper data is collected; use detailed flow instead.

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
            key={item.bid?._id || `${item.product._id}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Product Image */}
              <div className="flex-shrink-0">
                {item.product?.images?.[0]?.url ? (
                  <img
                    src={item.product.images[0].url}
                    alt={item.product?.title || "Product"}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg" />
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.product?.title || item.product?.name || "Untitled"}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-1" />
                    <span>
                      Won on {formatDate(item.auctionEndDate)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-green-600">
                      {formatCurrency(item.winAmount)}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Seller: {item.seller?.name || item.product?.vendor?.name || "Unknown"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 space-y-2">
                <Link
                  to={`/feedback/submit/${item.product._id}?bidId=${item.bid?._id}`}
                  className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Leave Feedback</span>
                </Link>
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
