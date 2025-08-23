const Bid = require("../models/bidModel");
const Product = require("../models/productModel");
const Wallet = require("../models/walletModel");
const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");
const { createNotification } = require("./notificationController");
const asyncHandler = require("express-async-handler");

// @desc    Place a bid on a product
// @route   POST /api/bids
// @access  Private
const placeBid = asyncHandler(async (req, res) => {
  const { productId, amount } = req.body;

  // Check if user is an admin (admins should not be allowed to bid)
  if (req.user.role === "admin") {
    res.status(403);
    throw new Error("Administrators are not allowed to place bids on products");
  }

  // Check if product exists and is active
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.status !== "active") {
    res.status(400);
    throw new Error("Product is not active for bidding");
  }

  // Get user's wallet
  let wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) {
    // Create wallet if it doesn't exist
    wallet = await Wallet.create({
      user: req.user._id,
      balance: 0,
      currency: "INR",
    });
  }

  // Check if user already has a bid on this product
  const userExistingBid = await Bid.findOne({
    product: productId,
    bidder: req.user._id,
  }).sort({ amount: -1 });

  // Check if user has sufficient funds
  // If user has existing bid, only check for the difference
  const amountToDeduct = userExistingBid
    ? Math.max(0, amount - userExistingBid.amount)
    : amount;

  if (amountToDeduct > 0 && !wallet.hasSufficientFunds(amountToDeduct)) {
    res.status(400);
    if (userExistingBid) {
      throw new Error(
        `Insufficient wallet balance. You need ₹${amountToDeduct} more to increase your bid from ₹${userExistingBid.amount} to ₹${amount}. Your current balance is ₹${wallet.balance}.`
      );
    } else {
      throw new Error(
        `Insufficient wallet balance. Your current balance is ₹${wallet.balance}. Please add funds to your wallet.`
      );
    }
  }

  // Check if bid amount is higher than current highest bid
  const highestBid = await Bid.findOne({ product: productId }).sort({
    amount: -1,
  });

  const currentHighestAmount = highestBid
    ? highestBid.amount
    : product.currentPrice;

  // Reject if bid is not higher than current highest amount
  if (amount <= currentHighestAmount) {
    res.status(400);
    throw new Error(
      `Bid amount must be higher than current highest bid of ₹${currentHighestAmount}`
    );
  }

  // If user has an existing bid, validate against their own bid
  if (userExistingBid && amount <= userExistingBid.amount) {
    res.status(400);
    throw new Error(
      `Your new bid must be higher than your current bid of ₹${userExistingBid.amount}`
    );
  }

  // Calculate the base increment (5% of starting price)
  const baseIncrement = Math.ceil(product.startingPrice * 0.05);

  // Verify the bid is a valid increment from the starting price
  const incrementsFromStarting = Math.floor(
    (amount - product.startingPrice) / baseIncrement
  );
  const validAmount =
    product.startingPrice + incrementsFromStarting * baseIncrement;

  // If amount is not within a small rounding error of a valid increment, reject it
  const roundingTolerance = 0.001; // Tolerance for floating point comparison
  if (Math.abs(amount - validAmount) > roundingTolerance) {
    // Calculate the next valid bid amount
    const nextValidAmount =
      product.startingPrice +
      Math.ceil((amount - product.startingPrice) / baseIncrement) *
        baseIncrement;

    res.status(400);
    throw new Error(
      `Invalid bid amount. Bids must be in increments of ₹${baseIncrement} from the base price of ₹${product.startingPrice}. ` +
        `Next valid amount would be ₹${nextValidAmount}.`
    );
  }

  // Start transaction-like operations
  try {
    // Check for existing bid with same amount to prevent duplicates
    const existingBidWithSameAmount = await Bid.findOne({
      product: productId,
      bidder: req.user._id,
      amount: amount,
    });

    if (existingBidWithSameAmount) {
      res.status(400);
      throw new Error("You have already placed this exact bid amount");
    }

    // Create bid first to get the bid ID
    const bid = await Bid.create({
      product: productId,
      bidder: req.user._id,
      amount,
    });

    // Only deduct the difference if user has existing bid, otherwise deduct full amount
    if (amountToDeduct > 0) {
      await wallet.deductFunds(
        amountToDeduct,
        "bid",
        userExistingBid
          ? `Bid increase on product: ${product.title || product.name} (from ₹${
              userExistingBid.amount
            } to ₹${amount})`
          : `Bid placed on product: ${product.title || product.name}`,
        bid._id,
        product._id
      );
    }

    // Update user's cached balance
    await User.findByIdAndUpdate(req.user._id, {
      walletBalance: wallet.balance,
    });

    // Update product's current price
    product.currentPrice = amount;
    await product.save();

    // Create notifications for bid events
    try {
      // Notify the product vendor about the new bid
      await createNotification({
        recipient: product.vendor,
        type: 'bid_placed',
        title: 'New Bid Placed',
        message: `${req.user.name} placed a bid of ₹${amount} on your product "${product.title}"`,
        data: {
          productId: product._id,
          bidId: bid._id,
          amount: amount,
          url: `/products/${product._id}`
        }
      });

      // If there was a previous highest bidder (not the current user), notify them they've been outbid
      if (highestBid && highestBid.bidder.toString() !== req.user._id.toString()) {
        await createNotification({
          recipient: highestBid.bidder,
          type: 'bid_outbid',
          title: 'You\'ve Been Outbid',
          message: `Your bid of ₹${highestBid.amount} on "${product.title}" has been outbid. New highest bid: ₹${amount}`,
          data: {
            productId: product._id,
            bidId: bid._id,
            amount: amount,
            url: `/products/${product._id}`
          }
        });
      }
    } catch (notificationError) {
      console.error('Error creating bid notifications:', notificationError);
      // Don't fail the bid if notification creation fails
    }

    // Populate the bid with user details for response
    await bid.populate("bidder", "name email");

    res.status(201).json({
      success: true,
      message: userExistingBid
        ? `Bid increased successfully from ₹${userExistingBid.amount} to ₹${amount}`
        : "Bid placed successfully",
      data: {
        bid,
        walletBalance: wallet.balance,
        amountDeducted: amountToDeduct,
        previousBid: userExistingBid?.amount || 0,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Failed to place bid: ${error.message}`);
  }
});

// @desc    Get all bids for a product
// @route   GET /api/bids/product/:productId
// @access  Public
const getProductBids = asyncHandler(async (req, res) => {
  const bids = await Bid.find({ product: req.params.productId })
    .sort({ amount: -1 })
    .populate("bidder", "name email");

  res.json(bids);
});

// @desc    Get all bids by current user
// @route   GET /api/bids/user
// @access  Private
const getUserBids = asyncHandler(async (req, res) => {
  const bids = await Bid.find({ bidder: req.user._id })
    .sort({ createdAt: -1 })
    .populate("product", "title images currentPrice");

  res.json(bids);
});

// @desc    Get overall bid statistics
// @route   GET /api/bids/stats
// @access  Public
const getBidStats = asyncHandler(async (req, res) => {
  const total = await Bid.countDocuments();
  const today = await Bid.countDocuments({
    createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
  });
  const activeBids = await Bid.countDocuments({ status: "active" });
  const wonBids = await Bid.countDocuments({ status: "won" });
  const lostBids = await Bid.countDocuments({ status: "lost" });

  const highestBid = await Bid.findOne().sort({ amount: -1 });
  const avgBidAmount = await Bid.aggregate([
    { $group: { _id: null, avg: { $avg: "$amount" } } },
  ]);

  res.json({
    total,
    today,
    activeBids,
    wonBids,
    lostBids,
    highestBidAmount: highestBid ? highestBid.amount : 0,
    averageBidAmount:
      avgBidAmount.length > 0 ? Math.round(avgBidAmount[0].avg) : 0,
  });
});

// @desc    Get single bid details
// @route   GET /api/bids/:bidId
// @access  Private
const getBid = asyncHandler(async (req, res) => {
  const { bidId } = req.params;

  // Validate if bidId is a valid ObjectId
  if (!bidId.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error("Invalid bid ID format");
  }

  const bid = await Bid.findById(bidId)
    .populate("bidder", "name email")
    .populate("product", "title images currentPrice startingPrice vendor");

  if (!bid) {
    res.status(404);
    throw new Error("Bid not found");
  }

  // Only allow users to view their own bids (or admins to view any bid)
  if (
    bid.bidder._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Access denied");
  }

  res.status(200).json({
    success: true,
    data: bid,
  });
});

module.exports = {
  placeBid,
  getProductBids,
  getUserBids,
  getBidStats,
  getBid,
};
