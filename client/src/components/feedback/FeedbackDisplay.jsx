import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Star,
  User,
  MessageSquare,
  Clock,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import api from "../../utils/api";
import { formatDate, formatCurrency } from "../../utils/format";

const FeedbackDisplay = ({ productId, sellerId, type = "product" }) => {
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedFeedback, setExpandedFeedback] = useState(new Set());

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const endpoint =
          type === "product"
            ? `/feedback/product/${productId}`
            : `/feedback/seller/${sellerId}`;

        const response = await api.get(endpoint);
        setFeedback(response.data.feedback);
        setStats(response.data.stats);
      } catch (error) {
        console.error("Failed to fetch feedback:", error);
      } finally {
        setLoading(false);
      }
    };

    if ((type === "product" && productId) || (type === "seller" && sellerId)) {
      fetchFeedback();
    }
  }, [productId, sellerId, type]);

  const toggleExpanded = (feedbackId) => {
    const newExpanded = new Set(expandedFeedback);
    if (newExpanded.has(feedbackId)) {
      newExpanded.delete(feedbackId);
    } else {
      newExpanded.add(feedbackId);
    }
    setExpandedFeedback(newExpanded);
  };

  const StarDisplay = ({ rating, size = "sm" }) => {
    const starSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const FeedbackStats = () => {
    if (!stats) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-lg mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {type === "product" ? "Product" : "Seller"} Ratings Overview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {stats.averageRating?.toFixed(1) || "0.0"}
            </div>
            <StarDisplay
              rating={Math.round(stats.averageRating || 0)}
              size="lg"
            />
            <p className="text-sm text-gray-500 mt-1">
              {stats.totalFeedback} review{stats.totalFeedback !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <span className="text-sm w-8">{rating}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${stats.ratingDistribution?.[rating] || 0}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-10">
                  {Math.round(stats.ratingDistribution?.[rating] || 0)}%
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {stats.positivePercentage?.toFixed(0) || 0}%
              </div>
              <p className="text-sm text-gray-500">Positive Reviews</p>
            </div>
            {stats.commonTags && stats.commonTags.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Common Tags:
                </p>
                <div className="flex flex-wrap gap-1">
                  {stats.commonTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const FeedbackItem = ({ item, index }) => {
    const isExpanded = expandedFeedback.has(item._id);
    const rating = type === "product" ? item.productRating : item.sellerRating;
    const comment =
      type === "product" ? item.productComment : item.sellerComment;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {item.buyer?.name || "Anonymous"}
              </p>
              <p className="text-sm text-gray-500">
                <Clock className="w-4 h-4 inline mr-1" />
                {format.formatDate(item.createdAt)}
              </p>
            </div>
          </div>
          {item.verified && (
            <div className="flex items-center text-green-600">
              <Shield className="w-4 h-4 mr-1" />
              <span className="text-sm">Verified Purchase</span>
            </div>
          )}
        </div>

        <div className="mb-4">
          <StarDisplay rating={rating} />
        </div>

        {comment && (
          <div className="mb-4">
            <p className="text-gray-700">{comment}</p>
          </div>
        )}

        {(item.experienceTags?.length > 0 || item.issues?.length > 0) && (
          <div className="mb-4 space-y-2">
            {item.experienceTags?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.experienceTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {item.issues?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.issues.map((issue) => (
                  <span
                    key={issue}
                    className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                  >
                    {issue}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Seller Response */}
        {item.sellerResponse && (
          <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Seller Response
              </span>
              <span className="text-xs text-blue-600">
                {format.formatDate(item.sellerResponse.createdAt)}
              </span>
            </div>
            <p className="text-blue-800 text-sm">
              {item.sellerResponse.message}
            </p>
          </div>
        )}

        {/* Show more details toggle */}
        {(type === "product" && item.sellerComment) ||
          (type === "seller" && item.productComment && (
            <button
              onClick={() => toggleExpanded(item._id)}
              className="mt-3 flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Show less</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>Show more details</span>
                </>
              )}
            </button>
          ))}

        {/* Expanded details */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            {type === "product" && item.sellerComment && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Seller Rating: <StarDisplay rating={item.sellerRating} />
                </h4>
                <p className="text-gray-700 text-sm">{item.sellerComment}</p>
              </div>
            )}
            {type === "seller" && item.productComment && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Product Rating: <StarDisplay rating={item.productRating} />
                </h4>
                <p className="text-gray-700 text-sm">{item.productComment}</p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FeedbackStats />

      {feedback.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Reviews Yet
          </h3>
          <p className="text-gray-500">
            Be the first to share your experience with this {type}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Customer Reviews ({feedback.length})
          </h3>
          {feedback.map((item, index) => (
            <FeedbackItem key={item._id} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackDisplay;
