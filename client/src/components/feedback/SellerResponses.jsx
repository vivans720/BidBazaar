import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, Star, User, AlertCircle } from "lucide-react";
import api from "../../utils/api";
import { formatDate, formatCurrency } from "../../utils/format";

const SellerResponses = () => {
  const [feedbackWithoutResponse, setFeedbackWithoutResponse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await api.get("/feedback/seller/responses");
        setFeedbackWithoutResponse(response.data);
      } catch (error) {
        console.error("Failed to fetch seller feedback:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const handleStartResponse = (feedbackId) => {
    setRespondingTo(feedbackId);
    setResponseText("");
  };

  const handleCancelResponse = () => {
    setRespondingTo(null);
    setResponseText("");
  };

  const handleSubmitResponse = async (feedbackId) => {
    if (!responseText.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/feedback/${feedbackId}/respond`, {
        message: responseText.trim(),
      });

      // Remove from list after successful response
      setFeedbackWithoutResponse((prev) =>
        prev.filter((item) => item._id !== feedbackId)
      );

      setRespondingTo(null);
      setResponseText("");
    } catch (error) {
      console.error("Failed to submit response:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const StarDisplay = ({ rating }) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">({rating})</span>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (feedbackWithoutResponse.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Pending Responses
        </h3>
        <p className="text-gray-500">
          You've responded to all feedback! Great customer service.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          Feedback Awaiting Response ({feedbackWithoutResponse.length})
        </h2>
        <p className="text-blue-700">
          Respond to customer feedback to show you care about their experience.
        </p>
      </div>

      <div className="space-y-4">
        {feedbackWithoutResponse.map((feedback, index) => (
          <motion.div
            key={feedback._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            {/* Product Info */}
            <div className="flex items-start space-x-4 mb-4">
              <img
                src={
                  feedback.product?.images?.[0] || "/placeholder-product.jpg"
                }
                alt={feedback.product?.name}
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {feedback.product?.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Reviewed on {format.formatDate(feedback.createdAt)}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {feedback.buyer?.name || "Anonymous"}
                </p>
                <p className="text-sm text-gray-500">Verified Purchase</p>
              </div>
            </div>

            {/* Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Product Rating:
                </p>
                <StarDisplay rating={feedback.productRating} />
                {feedback.productComment && (
                  <p className="text-gray-600 text-sm mt-2">
                    {feedback.productComment}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Seller Rating:
                </p>
                <StarDisplay rating={feedback.sellerRating} />
                {feedback.sellerComment && (
                  <p className="text-gray-600 text-sm mt-2">
                    {feedback.sellerComment}
                  </p>
                )}
              </div>
            </div>

            {/* Tags */}
            {(feedback.experienceTags?.length > 0 ||
              feedback.issues?.length > 0) && (
              <div className="mb-4 space-y-2">
                {feedback.experienceTags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {feedback.experienceTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {feedback.issues?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {feedback.issues.map((issue) => (
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

            {/* Response Section */}
            {respondingTo === feedback._id ? (
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      Your Response
                    </span>
                  </div>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Thank the customer, address any concerns, and show you value their feedback..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Tip: Be professional, acknowledge their feedback, and
                      offer solutions if needed.
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCancelResponse}
                        disabled={submitting}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSubmitResponse(feedback._id)}
                        disabled={submitting || !responseText.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
                      >
                        {submitting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Send Response</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => handleStartResponse(feedback._id)}
                  className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Respond to Feedback</span>
                </button>
              </div>
            )}

            {/* Alert for negative feedback */}
            {(feedback.productRating <= 2 ||
              feedback.sellerRating <= 2 ||
              feedback.issues?.length > 0) && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-orange-800 text-sm font-medium">
                    Action Recommended
                  </p>
                  <p className="text-orange-700 text-sm">
                    This feedback indicates areas for improvement. Consider
                    reaching out to address the customer's concerns.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SellerResponses;
