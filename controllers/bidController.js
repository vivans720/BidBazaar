const Bid = require('../models/bidModel');
const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');

// @desc    Place a bid on a product
// @route   POST /api/bids
// @access  Private
const placeBid = asyncHandler(async (req, res) => {
  const { productId, amount } = req.body;

  // Check if user is an admin (admins should not be allowed to bid)
  if (req.user.role === 'admin') {
    res.status(403);
    throw new Error('Administrators are not allowed to place bids on products');
  }

  // Check if product exists and is active
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.status !== 'active') {
    res.status(400);
    throw new Error('Product is not active for bidding');
  }

  // Check if bid amount is higher than current highest bid
  const highestBid = await Bid.findOne({ product: productId })
    .sort({ amount: -1 });
  
  const currentHighestAmount = highestBid ? highestBid.amount : product.currentPrice;
  
  // Reject if bid is not higher than current highest amount
  if (amount <= currentHighestAmount) {
    res.status(400);
    throw new Error(`Bid amount must be higher than current highest bid of ${currentHighestAmount}`);
  }

  // Calculate the base increment (5% of starting price)
  const baseIncrement = Math.ceil(product.startingPrice * 0.05);
  
  // Verify the bid is a valid increment from the starting price
  const incrementsFromStarting = Math.floor((amount - product.startingPrice) / baseIncrement);
  const validAmount = product.startingPrice + (incrementsFromStarting * baseIncrement);
  
  // If amount is not within a small rounding error of a valid increment, reject it
  const roundingTolerance = 0.001; // Tolerance for floating point comparison
  if (Math.abs(amount - validAmount) > roundingTolerance) {
    // Calculate the next valid bid amount
    const nextValidAmount = product.startingPrice + (Math.ceil((amount - product.startingPrice) / baseIncrement) * baseIncrement);
    
    res.status(400);
    throw new Error(
      `Invalid bid amount. Bids must be in increments of ${baseIncrement} from the base price of ${product.startingPrice}. ` +
      `Next valid amount would be ${nextValidAmount}.`
    );
  }

  // Create bid
  const bid = await Bid.create({
    product: productId,
    bidder: req.user._id,
    amount
  });

  // Update product's current price
  product.currentPrice = amount;
  await product.save();

  res.status(201).json(bid);
});

// @desc    Get all bids for a product
// @route   GET /api/bids/product/:productId
// @access  Public
const getProductBids = asyncHandler(async (req, res) => {
  const bids = await Bid.find({ product: req.params.productId })
    .sort({ amount: -1 })
    .populate('bidder', 'name email');

  res.json(bids);
});

// @desc    Get all bids by current user
// @route   GET /api/bids/user
// @access  Private
const getUserBids = asyncHandler(async (req, res) => {
  const bids = await Bid.find({ bidder: req.user._id })
    .sort({ createdAt: -1 })
    .populate('product', 'title images currentPrice');

  res.json(bids);
});

// @desc    Get overall bid statistics
// @route   GET /api/bids/stats
// @access  Public
const getBidStats = asyncHandler(async (req, res) => {
  const total = await Bid.countDocuments();
  const today = await Bid.countDocuments({
    createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
  });
  const activeBids = await Bid.countDocuments({ status: 'active' });
  const wonBids = await Bid.countDocuments({ status: 'won' });
  const lostBids = await Bid.countDocuments({ status: 'lost' });

  const highestBid = await Bid.findOne().sort({ amount: -1 });
  const avgBidAmount = await Bid.aggregate([
    { $group: { _id: null, avg: { $avg: '$amount' } } }
  ]);

  res.json({
    total,
    today,
    activeBids,
    wonBids,
    lostBids,
    highestBidAmount: highestBid ? highestBid.amount : 0,
    averageBidAmount: avgBidAmount.length > 0 ? Math.round(avgBidAmount[0].avg) : 0
  });
});

module.exports = {
  placeBid,
  getProductBids,
  getUserBids,
  getBidStats
}; 