import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  StarIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  TrophyIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import api from "../../utils/api";

const SellerFeedbackDashboard = ({ sellerId }) => {
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sellerId) {
      fetchSellerFeedback();
    }
  }, [sellerId]);

  const fetchSellerFeedback = async () => {
    try {
      setLoading(true);
      console.log("Fetching feedback for seller:", sellerId);
      
      const [statsResponse, feedbackResponse] = await Promise.all([
        api.get(`/feedback/seller/${sellerId}?limit=1`), // Just get stats
        api.get(`/feedback/seller/${sellerId}?limit=5`), // Get recent feedback
      ]);

      console.log("Stats response:", statsResponse.data);
      console.log("Feedback response:", feedbackResponse.data);

      // Safely set stats with defaults
      const stats = statsResponse.data?.data?.stats || {};
      setFeedbackStats({
        totalFeedbacks: stats.totalFeedbacks || 0,
        averageSellerRating: stats.averageSellerRating || 0,
        averageProductRating: stats.averageProductRating || 0,
        recommendationRate: stats.recommendationRate || 0,
        ...stats
      });
      
      // Safely set feedback array
      setRecentFeedback(feedbackResponse.data?.data?.feedback || []);
    } catch (error) {
      console.error("Error fetching seller feedback:", error);
      console.error("Error details:", error.response?.data || error.message);
      
      // Set safe default state on error
      setFeedbackStats({
        totalFeedbacks: 0,
        averageSellerRating: 0,
        averageProductRating: 0,
        recommendationRate: 0
      });
      setRecentFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  const StarDisplay = ({ rating, size = "small" }) => {
    const sizeClasses = {
      small: "w-4 h-4",
      medium: "w-5 h-5",
      large: "w-6 h-6",
    };

    const safeRating = rating || 0;

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={sizeClasses[size]}>
            {star <= Math.round(safeRating) ? (
              <StarIconSolid className="text-yellow-400" />
            ) : (
              <StarIcon className="text-gray-300" />
            )}
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600 font-medium">
          {safeRating.toFixed(1)}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-4 h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!feedbackStats || !feedbackStats.totalFeedbacks || feedbackStats.totalFeedbacks === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Customer Feedback
        </h3>
        <p className="text-gray-600 mb-2">
          You haven't received any customer feedback yet.
        </p>
        <p className="text-sm text-gray-500">
          Complete your first sale to start receiving customer feedback and build your seller reputation.
        </p>
      </div>
    );
  }

  const getRatingColor = (rating) => {
    const safeRating = rating || 0;
    if (safeRating >= 4.5) return "text-green-600";
    if (safeRating >= 4.0) return "text-yellow-600";
    if (safeRating >= 3.0) return "text-orange-600";
    return "text-red-600";
  };

  const getRatingBgColor = (rating) => {
    const safeRating = rating || 0;
    if (safeRating >= 4.5) return "bg-green-50 border-green-200";
    if (safeRating >= 4.0) return "bg-yellow-50 border-yellow-200";
    if (safeRating >= 3.0) return "bg-orange-50 border-orange-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className="space-y-6">
      {/* Feedback Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg p-4 border-2 ${getRatingBgColor(
            feedbackStats.averageSellerRating
          )}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Seller Rating</p>
              <div className="mt-1">
                <StarDisplay
                  rating={feedbackStats.averageSellerRating}
                  size="medium"
                />
              </div>
            </div>
            <div
              className={`rounded-full p-2 ${
                feedbackStats.averageSellerRating >= 4.5
                  ? "bg-green-100"
                  : "bg-yellow-100"
              }`}
            >
              <TrophyIcon
                className={`h-6 w-6 ${
                  feedbackStats.averageSellerRating >= 4.5
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-lg p-4 border-2 ${getRatingBgColor(
            feedbackStats.averageProductRating
          )}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Product Rating
              </p>
              <div className="mt-1">
                <StarDisplay
                  rating={feedbackStats.averageProductRating}
                  size="medium"
                />
              </div>
            </div>
            <div
              className={`rounded-full p-2 ${
                feedbackStats.averageProductRating >= 4.5
                  ? "bg-green-100"
                  : "bg-yellow-100"
              }`}
            >
              <ChartBarIcon
                className={`h-6 w-6 ${
                  feedbackStats.averageProductRating >= 4.5
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-blue-600">
                {feedbackStats?.totalFeedbacks || 0}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {Math.round((feedbackStats?.recommendationRate || 0) * 100)}% recommend
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-2">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Feedback */}
      {recentFeedback.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              Recent Customer Reviews
            </h4>
            <Link
              to={`/feedback/seller/${sellerId}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {recentFeedback.slice(0, 3).map((feedback, index) => (
              <motion.div
                key={feedback._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {feedback.buyer?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {feedback.buyer?.name || "Anonymous"}
                    </p>
                    <div className="flex space-x-2">
                      <StarDisplay
                        rating={feedback.sellerRating}
                        size="small"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </p>
                  {feedback.sellerReview && (
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                      "{feedback.sellerReview}"
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SellerFeedbackDashboard;
