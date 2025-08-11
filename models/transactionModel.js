const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "deposit", // Adding money to wallet
        "withdrawal", // Withdrawing money from wallet
        "bid", // Money deducted for placing bid
        "bid_refund", // Money refunded when outbid
        "auction_win", // Final payment when winning auction
        "auction_refund", // Refund when auction is cancelled
        "admin_adjustment", // Admin manual adjustment
      ],
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    relatedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    relatedBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bid",
    },
    paymentMethod: {
      type: String,
      enum: [
        "bank_transfer",
        "credit_card",
        "debit_card",
        "paypal",
        "crypto",
        "admin",
      ],
      default: "bank_transfer",
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values but ensures uniqueness when present
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // For storing additional payment gateway data
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ wallet: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ transactionId: 1 });
// Compound index to prevent duplicate bid/bid_refund transactions for the same bid
transactionSchema.index(
  { relatedBid: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: {
      relatedBid: { $exists: true },
      type: { $in: ["bid", "bid_refund", "auction_win"] },
    },
  }
);

// Pre-save middleware to generate transaction ID
transactionSchema.pre("save", function (next) {
  if (!this.transactionId) {
    // Generate unique transaction ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.transactionId = `TXN_${timestamp}_${random}`.toUpperCase();
  }
  next();
});

module.exports = mongoose.model("Transaction", transactionSchema);
