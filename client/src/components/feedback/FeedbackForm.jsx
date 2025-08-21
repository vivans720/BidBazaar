import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, Send, AlertCircle } from "lucide-react";
import api from "../../utils/api";

const FeedbackForm = ({ product, winningBidId, onSubmit }) => {
  const [formData, setFormData] = useState({
    productRating: 0,
    sellerRating: 0,
    productComment: "",
    sellerComment: "",
    experienceTags: [],
    issues: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const experienceOptions = [
    "Excellent Quality",
    "Fast Delivery",
    "As Described",
    "Good Packaging",
    "Professional Seller",
    "Quick Response",
    "Smooth Transaction",
    "Would Buy Again",
  ];

  const issueOptions = [
    "Quality Issues",
    "Delivery Delay",
    "Damaged Item",
    "Poor Packaging",
    "Communication Issues",
    "Not as Described",
    "Other",
  ];

  const handleRatingClick = (type, rating) => {
    setFormData((prev) => ({
      ...prev,
      [type]: rating,
    }));
  };

  const handleTagToggle = (tag, type) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].includes(tag)
        ? prev[type].filter((t) => t !== tag)
        : [...prev[type], tag],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.productRating === 0 || formData.sellerRating === 0) {
      setError("Please provide both product and seller ratings");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post(`/feedback`, {
        productId: product._id,
        winningBidId,
        productRating: formData.productRating,
        productReview: formData.productComment,
        sellerRating: formData.sellerRating,
        sellerReview: formData.sellerComment,
        experienceTags: formData.experienceTags,
        issues: formData.issues,
      });
      onSubmit?.();
    } catch (error) {
      setError(
        error.response?.data?.error || error.response?.data?.message || "Failed to submit feedback"
      );
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ rating, onRatingClick, label }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingClick(star)}
            className={`p-1 transition-colors ${
              star <= rating
                ? "text-yellow-400 hover:text-yellow-500"
                : "text-gray-300 hover:text-gray-400"
            }`}
          >
            <Star
              className={`w-6 h-6 ${star <= rating ? "fill-current" : ""}`}
            />
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        {rating > 0 && `${rating} star${rating !== 1 ? "s" : ""}`}
      </p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Rate Your Experience
        </h2>
        <p className="text-gray-600">
          Please share your feedback about the product and seller
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Rating */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rate the Product
          </h3>
          <StarRating
            rating={formData.productRating}
            onRatingClick={(rating) =>
              handleRatingClick("productRating", rating)
            }
            label="Product Quality"
          />
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Comments
            </label>
            <textarea
              value={formData.productComment}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  productComment: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Share your thoughts about the product..."
            />
          </div>
        </div>

        {/* Seller Rating */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rate the Seller
          </h3>
          <StarRating
            rating={formData.sellerRating}
            onRatingClick={(rating) =>
              handleRatingClick("sellerRating", rating)
            }
            label="Seller Service"
          />
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seller Comments
            </label>
            <textarea
              value={formData.sellerComment}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sellerComment: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Share your experience with the seller..."
            />
          </div>
        </div>

        {/* Experience Tags */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Positive Experience (Optional)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {experienceOptions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag, "experienceTags")}
                className={`p-2 text-sm rounded-md border transition-colors ${
                  formData.experienceTags.includes(tag)
                    ? "bg-green-100 border-green-300 text-green-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Issues */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Any Issues? (Optional)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {issueOptions.map((issue) => (
              <button
                key={issue}
                type="button"
                onClick={() => handleTagToggle(issue, "issues")}
                className={`p-2 text-sm rounded-md border transition-colors ${
                  formData.issues.includes(issue)
                    ? "bg-red-100 border-red-300 text-red-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {issue}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={
              loading ||
              formData.productRating === 0 ||
              formData.sellerRating === 0
            }
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Feedback</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default FeedbackForm;
