import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  StarIcon,
  ArrowLeftIcon,
  ShoppingBagIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import api from "../utils/api";
import { formatCurrency, formatDate } from "../utils/format";

const FeedbackSubmissionPage = () => {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bidId = searchParams.get("bidId");

  const [product, setProduct] = useState(null);
  const [bid, setBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    sellerRating: 0,
    sellerComment: "",
    experienceTags: [],
    issues: [],
    wouldRecommend: true,
    deliveryRating: 5,
  });

  const experienceOptions = [
    { value: "fast_shipping", label: "Fast Shipping" },
    { value: "excellent_packaging", label: "Excellent Packaging" },
    { value: "as_described", label: "As Described" },
    { value: "good_communication", label: "Good Communication" },
    { value: "professional_seller", label: "Professional Seller" },
    { value: "would_buy_again", label: "Would Buy Again" },
    { value: "exceeded_expectations", label: "Exceeded Expectations" },
    { value: "great_value", label: "Great Value" },
    { value: "quick_response", label: "Quick Response" },
    { value: "helpful_seller", label: "Helpful Seller" },
  ];

  const issueOptions = [
    { value: "late_delivery", label: "Late Delivery" },
    { value: "poor_packaging", label: "Poor Packaging" },
    { value: "not_as_described", label: "Not as Described" },
    { value: "poor_communication", label: "Poor Communication" },
    { value: "item_damaged", label: "Item Damaged" },
    { value: "quality_issues", label: "Quality Issues" },
    { value: "shipping_problems", label: "Shipping Problems" },
    { value: "seller_unresponsive", label: "Seller Unresponsive" },
  ];

  useEffect(() => {
    fetchProductAndBid();
  }, [productId, bidId]);

  const fetchProductAndBid = async () => {
    try {
      setLoading(true);
      const [productResponse, bidResponse, pendingResponse] = await Promise.all(
        [
          api.get(`/products/${productId}`),
          bidId ? api.get(`/bids/${bidId}`) : Promise.resolve(null),
          api.get(`/feedback/my/pending`),
        ]
      );

      setProduct(productResponse.data.data);
      if (bidResponse) {
        setBid(bidResponse.data.data);
      }

      // Verify user is eligible (won and pending feedback for this product)
      const pendingList = pendingResponse?.data?.data || [];
      const isPending = pendingList.some(
        (entry) => entry?.product?._id === productId
      );

      if (!isPending) {
        toast.info(
          "No pending feedback for this auction. You may have already submitted or are not the winner."
        );
        navigate("/dashboard");
        return;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load auction details");
      toast.error("Failed to load auction details");
    } finally {
      setLoading(false);
    }
  };

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

    if (formData.sellerRating === 0) {
      toast.error("Please provide a seller rating");
      return;
    }

    if (!formData.sellerComment.trim()) {
      toast.error("Please provide a comment for the seller");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/feedback", {
        productId: product._id,
        winningBidId: bid?._id || bidId,
        sellerRating: formData.sellerRating,
        sellerReview: formData.sellerComment,
        experienceTags: formData.experienceTags,
        issues: formData.issues,
        wouldRecommend: formData.wouldRecommend,
        deliveryRating: formData.deliveryRating,
      });

      toast.success("Thank you for your feedback!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error(error.response?.data?.error || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingClick, label, size = "medium" }) => {
    const sizeClasses = {
      small: "w-5 h-5",
      medium: "w-6 h-6",
      large: "w-8 h-8",
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingClick(star)}
              className={`${sizeClasses[size]} transition-colors hover:scale-110 transform`}
            >
              {star <= rating ? (
                <StarIconSolid className="text-yellow-400" />
              ) : (
                <StarIcon className="text-gray-300 hover:text-yellow-400" />
              )}
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {rating > 0 ? `${rating}/5` : "Click to rate"}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to Load
          </h2>
          <p className="text-gray-600 mb-4">{error || "Product not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Rate Your Purchase
          </h1>
          <p className="mt-2 text-gray-600">
            Share your experience to help other buyers and improve our
            marketplace
          </p>
        </div>

        {/* Product Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
              {product.images?.[0]?.url ? (
                <img
                  src={product.images[0].url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBagIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {product.title}
              </h2>
              <div className="mt-2 space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Seller: {product.vendor?.name || "Unknown"}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
                  Won for {formatCurrency(product.currentPrice)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✨ Auction Won
              </span>
            </div>
          </div>
        </motion.div>

        {/* Feedback Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6 space-y-8"
        >
          {/* Seller Rating Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-6 h-6 mr-2 text-green-600" />
              Rate the Seller
            </h3>

            <StarRating
              rating={formData.sellerRating}
              onRatingClick={(rating) =>
                handleRatingClick("sellerRating", rating)
              }
              label="Seller Service"
              size="large"
            />

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seller Review
              </label>
              <textarea
                value={formData.sellerComment}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sellerComment: e.target.value,
                  }))
                }
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="How was the communication, delivery, and overall seller experience?"
              />
            </div>
          </div>

          {/* Experience Tags */}
          <div className="border-b border-gray-200 pb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3">
              What went well?
            </h4>
            <div className="flex flex-wrap gap-2">
              {experienceOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    handleTagToggle(option.value, "experienceTags")
                  }
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                    formData.experienceTags.includes(option.value)
                      ? "bg-green-100 text-green-800 border-green-300"
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Issues (Optional) */}
          <div className="border-b border-gray-200 pb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3">
              Any issues? (Optional)
            </h4>
            <div className="flex flex-wrap gap-2">
              {issueOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleTagToggle(option.value, "issues")}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                    formData.issues.includes(option.value)
                      ? "bg-red-100 text-red-800 border-red-300"
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="border-b border-gray-200 pb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3">
              Would you recommend this seller?
            </h4>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, wouldRecommend: true }))
                }
                className={`px-4 py-2 rounded-md font-medium ${
                  formData.wouldRecommend
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-gray-100 text-gray-700 border border-gray-300"
                }`}
              >
                👍 Yes, recommend
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, wouldRecommend: false }))
                }
                className={`px-4 py-2 rounded-md font-medium ${
                  !formData.wouldRecommend
                    ? "bg-red-100 text-red-800 border border-red-300"
                    : "bg-gray-100 text-gray-700 border border-gray-300"
                }`}
              >
                👎 No, wouldn't recommend
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || formData.sellerRating === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <StarIcon className="w-4 h-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default FeedbackSubmissionPage;
