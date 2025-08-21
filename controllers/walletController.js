const Wallet = require("../models/walletModel");
const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

// @desc    Get user's wallet details
// @route   GET /api/wallet
// @access  Private
const getWallet = asyncHandler(async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
        balance: 0,
      });
    }

    res.status(200).json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @desc    Add funds to wallet
// @route   POST /api/wallet/deposit
// @access  Private
const depositFunds = asyncHandler(async (req, res) => {
  try {
    const { amount, paymentMethod = "bank_transfer", description } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid amount greater than 0",
      });
    }

    // Maximum deposit limit (₹10,00,000 = 1,000,000)
    if (amount > 1000000) {
      return res.status(400).json({
        success: false,
        error: "Maximum deposit limit is ₹10,00,000",
      });
    }

    // Minimum deposit limit (₹100)
    if (amount < 100) {
      return res.status(400).json({
        success: false,
        error: "Minimum deposit amount is ₹100",
      });
    }

    let wallet = await Wallet.findOne({ user: req.user._id });

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
        balance: 0,
        currency: "INR",
      });
    }

    // Check for recent duplicate deposits (within last 5 minutes)
    const Transaction = require("../models/transactionModel");
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentSimilarDeposit = await Transaction.findOne({
      user: req.user._id,
      type: "deposit",
      amount: amount,
      createdAt: { $gte: fiveMinutesAgo },
      status: "completed",
    });

    if (recentSimilarDeposit) {
      return res.status(400).json({
        success: false,
        error:
          "Duplicate deposit detected. Please wait a few minutes before making another deposit with the same amount.",
      });
    }

    // Add funds to wallet
    const finalDescription =
      description || `Deposit of ₹${amount} via ${paymentMethod}`;
    await wallet.addFunds(amount, "deposit", finalDescription);

    // Update user's wallet balance cache
    await User.findByIdAndUpdate(req.user._id, {
      walletBalance: wallet.balance,
    });

    res.status(200).json({
      success: true,
      message: "Funds added successfully",
      data: {
        wallet,
        newBalance: wallet.balance,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @desc    Withdraw funds from wallet
// @route   POST /api/wallet/withdraw
// @access  Private
const withdrawFunds = asyncHandler(async (req, res) => {
  try {
    const { amount, paymentMethod = "bank_transfer", description } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid amount greater than 0",
      });
    }

    let wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found",
      });
    }

    // Check if user has sufficient funds
    if (!wallet.hasSufficientFunds(amount)) {
      return res.status(400).json({
        success: false,
        error: "Insufficient funds in wallet",
      });
    }

    // Minimum withdrawal amount (₹100)
    if (amount < 100) {
      return res.status(400).json({
        success: false,
        error: "Minimum withdrawal amount is ₹100",
      });
    }

    // Deduct funds from wallet
    const finalDescription =
      description || `Withdrawal of ₹${amount} via ${paymentMethod}`;
    await wallet.deductFunds(amount, "withdrawal", finalDescription);

    // Update user's wallet balance cache
    await User.findByIdAndUpdate(req.user._id, {
      walletBalance: wallet.balance,
    });

    res.status(200).json({
      success: true,
      message: "Withdrawal request processed successfully",
      data: {
        wallet,
        newBalance: wallet.balance,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @desc    Get wallet transaction history
// @route   GET /api/wallet/transactions
// @access  Private
const getTransactionHistory = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { type, status, startDate, endDate } = req.query;

    // Build query filter
    const filter = { user: req.user._id };

    if (type) filter.type = type;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate("relatedProduct", "title images")
      .populate("relatedBid", "amount")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Transaction.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @desc    Get wallet statistics
// @route   GET /api/wallet/stats
// @access  Private
const getWalletStats = asyncHandler(async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found",
      });
    }

    // Get transaction statistics
    const [
      totalDeposits,
      totalWithdrawals,
      totalBids,
      totalRefunds,
      transactionCount,
    ] = await Promise.all([
      Transaction.aggregate([
        {
          $match: { user: req.user._id, type: "deposit", status: "completed" },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            type: "withdrawal",
            status: "completed",
          },
        },
        { $group: { _id: null, total: { $sum: { $abs: "$amount" } } } },
      ]),
      Transaction.aggregate([
        { $match: { user: req.user._id, type: "bid", status: "completed" } },
        { $group: { _id: null, total: { $sum: { $abs: "$amount" } } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            type: "bid_refund",
            status: "completed",
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.countDocuments({ user: req.user._id }),
    ]);

    const stats = {
      currentBalance: wallet.balance,
      totalDeposited: totalDeposits[0]?.total || 0,
      totalWithdrawn: totalWithdrawals[0]?.total || 0,
      totalBidAmount: totalBids[0]?.total || 0,
      totalRefunded: totalRefunds[0]?.total || 0,
      totalTransactions: transactionCount,
      walletCreated: wallet.createdAt,
      lastTransaction: wallet.lastTransaction,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = {
  getWallet,
  depositFunds,
  withdrawFunds,
  getTransactionHistory,
  getWalletStats,
};
