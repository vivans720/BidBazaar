const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/userModel");
const Wallet = require("../models/walletModel");
const Transaction = require("../models/transactionModel");
const Bid = require("../models/bidModel");
const Product = require("../models/productModel");

// Load env vars
dotenv.config();

const checkUserWallet = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find user 'puru' (or similar name)
    const user = await User.findOne({
      $or: [
        { name: { $regex: "puru", $options: "i" } },
        { email: { $regex: "puru", $options: "i" } },
      ],
    });

    if (!user) {
      console.log("User not found");
      return;
    }

    console.log(`\nUser: ${user.name} (${user.email})`);

    // Get wallet
    const wallet = await Wallet.findOne({ user: user._id });
    if (wallet) {
      console.log(`Wallet Balance: ₹${wallet.balance} ${wallet.currency}`);
    } else {
      console.log("No wallet found");
    }

    // Get recent transactions
    console.log("\nRecent Transactions:");
    const transactions = await Transaction.find({ user: user._id })
      .populate("relatedProduct", "title")
      .populate("relatedBid", "amount")
      .sort({ createdAt: -1 })
      .limit(10);

    transactions.forEach((transaction) => {
      const date = transaction.createdAt.toLocaleString();
      const product = transaction.relatedProduct?.title || "N/A";
      console.log(
        `${date} | ${transaction.type} | ₹${transaction.amount} | Balance: ₹${transaction.balanceAfter} | ${transaction.description}`
      );
    });

    // Get user's bids
    console.log("\nUser Bids:");
    const bids = await Bid.find({ bidder: user._id })
      .populate("product", "title status")
      .sort({ createdAt: -1 });

    bids.forEach((bid) => {
      console.log(
        `${bid.product.title} | Amount: ₹${bid.amount} | Status: ${bid.status} | Product Status: ${bid.product.status}`
      );
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.connection.close();
    console.log("\nDatabase connection closed");
  }
};

// Run the check
checkUserWallet();
