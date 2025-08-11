const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, "Wallet balance cannot be negative"],
    },
    currency: {
      type: String,
      default: "INR",
      enum: ["USD", "EUR", "INR", "GBP"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastTransaction: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient user lookup
walletSchema.index({ user: 1 });

// Method to add funds to wallet
walletSchema.methods.addFunds = async function (
  amount,
  transactionType = "deposit",
  description = "Funds added to wallet",
  relatedBid = null,
  relatedProduct = null
) {
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  // Check for duplicate transactions if relatedBid is provided
  if (relatedBid && ["bid_refund", "auction_win"].includes(transactionType)) {
    const Transaction = require("./transactionModel");
    const existingTransaction = await Transaction.findOne({
      relatedBid: relatedBid,
      type: transactionType,
      user: this.user,
    });

    if (existingTransaction) {
      console.log(
        `Transaction already exists for bid ${relatedBid} with type ${transactionType}`
      );
      return this; // Return without creating duplicate
    }
  }

  this.balance += amount;
  this.lastTransaction = new Date();

  // Create transaction record
  const Transaction = require("./transactionModel");
  const transactionData = {
    wallet: this._id,
    user: this.user,
    type: transactionType,
    amount: amount,
    balanceAfter: this.balance,
    description: description,
    status: "completed",
  };

  if (relatedBid) transactionData.relatedBid = relatedBid;
  if (relatedProduct) transactionData.relatedProduct = relatedProduct;

  await Transaction.create(transactionData);

  return await this.save();
};

// Method to deduct funds from wallet
walletSchema.methods.deductFunds = async function (
  amount,
  transactionType = "bid",
  description = "Funds deducted for bid",
  relatedBid = null,
  relatedProduct = null
) {
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  if (this.balance < amount) {
    throw new Error("Insufficient funds in wallet");
  }

  // Check for duplicate transactions if relatedBid is provided
  if (relatedBid && transactionType === "bid") {
    const Transaction = require("./transactionModel");
    const existingTransaction = await Transaction.findOne({
      relatedBid: relatedBid,
      type: transactionType,
      user: this.user,
    });

    if (existingTransaction) {
      console.log(
        `Transaction already exists for bid ${relatedBid} with type ${transactionType}`
      );
      return this; // Return without creating duplicate
    }
  }

  this.balance -= amount;
  this.lastTransaction = new Date();

  // Create transaction record
  const Transaction = require("./transactionModel");
  const transactionData = {
    wallet: this._id,
    user: this.user,
    type: transactionType,
    amount: -amount, // Negative for deduction
    balanceAfter: this.balance,
    description: description,
    status: "completed",
  };

  if (relatedBid) transactionData.relatedBid = relatedBid;
  if (relatedProduct) transactionData.relatedProduct = relatedProduct;

  await Transaction.create(transactionData);

  return await this.save();
};

// Method to check if user has sufficient funds
walletSchema.methods.hasSufficientFunds = function (amount) {
  return this.balance >= amount;
};

module.exports = mongoose.model("Wallet", walletSchema);
