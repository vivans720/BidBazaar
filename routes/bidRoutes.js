const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  placeBid,
  getProductBids,
  getUserBids,
  getBidStats,
  getBid,
} = require("../controllers/bidController");

/**
 * @route   POST /api/bids
 * @desc    Place a new bid on a product
 * @access  Private
 */
router.post("/", protect, placeBid);

/**
 * @route   GET /api/bids/product/:productId
 * @desc    Get all bids for a specific product
 * @access  Public
 */
router.get("/product/:productId", getProductBids);

/**
 * @route   GET /api/bids/user
 * @desc    Get all bids made by the current user
 * @access  Private
 */
router.get("/user", protect, getUserBids);

/**
 * @route   GET /api/bids/stats
 * @desc    Get overall bid statistics for the platform
 * @access  Public
 */
router.get("/stats", getBidStats);

/**
 * @route   GET /api/bids/:bidId
 * @desc    Get single bid details
 * @access  Private
 */
router.get("/:bidId", protect, getBid);

module.exports = router;
