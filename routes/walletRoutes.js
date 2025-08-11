const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getWallet,
  depositFunds,
  withdrawFunds,
  getTransactionHistory,
  getWalletStats,
} = require("../controllers/walletController");

/**
 * @route   GET /api/wallet
 * @desc    Get user's wallet details
 * @access  Private
 */
router.get("/", protect, getWallet);

/**
 * @route   POST /api/wallet/deposit
 * @desc    Add funds to wallet
 * @access  Private
 */
router.post("/deposit", protect, depositFunds);

/**
 * @route   POST /api/wallet/withdraw
 * @desc    Withdraw funds from wallet
 * @access  Private
 */
router.post("/withdraw", protect, withdrawFunds);

/**
 * @route   GET /api/wallet/transactions
 * @desc    Get wallet transaction history
 * @access  Private
 */
router.get("/transactions", protect, getTransactionHistory);

/**
 * @route   GET /api/wallet/stats
 * @desc    Get wallet statistics
 * @access  Private
 */
router.get("/stats", protect, getWalletStats);

module.exports = router;
