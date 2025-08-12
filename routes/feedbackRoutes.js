const express = require("express");
const {
  submitFeedback,
  getProductFeedback,
  getSellerFeedback,
  getMyFeedback,
  getPendingFeedback,
  respondToFeedback,
  getFeedbackById,
  flagFeedback,
  getFeedbackStats,
} = require("../controllers/feedbackController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/product/:productId", getProductFeedback);
router.get("/seller/:sellerId", getSellerFeedback);
router.get("/:feedbackId", getFeedbackById);

// Protected routes (require authentication)
router.use(protect);

// Buyer routes
router.post("/", submitFeedback);
router.get("/my/feedback", getMyFeedback);
router.get("/my/pending", getPendingFeedback);

// Seller routes
router.put("/:feedbackId/respond", authorize("vendor"), respondToFeedback);

// Admin routes
router.put("/:feedbackId/flag", authorize("admin"), flagFeedback);
router.get("/stats/overview", authorize("admin"), getFeedbackStats);

module.exports = router;
