const Feedback = require("../models/feedbackModel");
const Product = require("../models/productModel");
const Bid = require("../models/bidModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

// @desc    Submit feedback for a won auction
// @route   POST /api/feedback
// @access  Private (Buyers only)
const submitFeedback = asyncHandler(async (req, res) => {
  const {
    productId,
    winningBidId,
    sellerRating,
    sellerReview,
    experienceTags,
    issues,
    wouldRecommend,
    deliveryRating,
  } = req.body;

  // Validate required fields
  if (
    !productId ||
    !winningBidId ||
    !sellerRating ||
    !sellerReview ||
    wouldRecommend === undefined
  ) {
    return res.status(400).json({
      success: false,
      error: "Please provide all required fields",
    });
  }

  // Validate rating values
  if (sellerRating < 1 || sellerRating > 5) {
    return res.status(400).json({
      success: false,
      error: "Seller rating must be between 1 and 5",
    });
  }

  if (deliveryRating && (deliveryRating < 1 || deliveryRating > 5)) {
    return res.status(400).json({
      success: false,
      error: "Delivery rating must be between 1 and 5",
    });
  }

  try {
    // Get the product and verify it exists
    const product = await Product.findById(productId).populate(
      "vendor",
      "name email"
    );
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Verify the auction has ended
    if (product.status !== "ended") {
      return res.status(400).json({
        success: false,
        error: "Can only submit feedback for ended auctions",
      });
    }

    // Get the winning bid and verify user won the auction
    const winningBid = await Bid.findOne({
      _id: winningBidId,
      product: productId,
      bidder: req.user._id,
      status: "won",
    });

    if (!winningBid) {
      return res.status(403).json({
        success: false,
        error: "You can only submit feedback for auctions you have won",
      });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({
      product: productId,
      buyer: req.user._id,
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        error: "You have already submitted feedback for this auction",
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      product: productId,
      buyer: req.user._id,
      seller: product.vendor._id,
      winningBid: winningBidId,
      sellerRating: parseInt(sellerRating),
      sellerReview: sellerReview.trim(),
      experienceTags: experienceTags || [],
      issues: issues || [],
      wouldRecommend: Boolean(wouldRecommend),
      deliveryRating: deliveryRating ? parseInt(deliveryRating) : undefined,
    });

    // Populate the feedback for response
    await feedback.populate([
      { path: "product", select: "title images" },
      { path: "buyer", select: "name" },
      { path: "seller", select: "name" },
    ]);

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @desc    Get feedback for a specific product
// @route   GET /api/feedback/product/:productId
// @access  Public
const getProductFeedback = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const skip = (page - 1) * limit;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const feedback = await Feedback.find({
      product: req.params.productId,
      status: "active",
    })
      .populate("buyer", "name profileImage")
      .populate("seller", "name")
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Feedback.countDocuments({
      product: req.params.productId,
      status: "active",
    });

    // Get product feedback statistics
    const stats = await Feedback.getProductStats(req.params.productId);

    res.status(200).json({
      success: true,
      data: {
        feedback,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalFeedbacks: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @desc    Get feedback for a specific seller
// @route   GET /api/feedback/seller/:sellerId
// @access  Public
const getSellerFeedback = asyncHandler(async (req, res) => {
  try {
    console.log("Getting feedback for seller:", req.params.sellerId);

    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const skip = (page - 1) * limit;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // First, let's check if any feedback exists for this seller
    const allFeedback = await Feedback.find({ seller: req.params.sellerId });
    console.log(
      `Found ${allFeedback.length} total feedback entries for seller`
    );
    console.log(
      "All feedback:",
      allFeedback.map((f) => ({
        id: f._id,
        status: f.status,
        sellerRating: f.sellerRating,
      }))
    );

    const feedback = await Feedback.find({
      seller: req.params.sellerId,
      status: "active",
    })
      .populate("buyer", "name profileImage")
      .populate("product", "title images")
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    console.log(`Found ${feedback.length} active feedback entries for seller`);

    const total = await Feedback.countDocuments({
      seller: req.params.sellerId,
      status: "active",
    });

    // Get seller statistics
    const stats = await Feedback.getSellerStats(req.params.sellerId);
    console.log("Seller stats:", stats);

    res.status(200).json({
      success: true,
      data: {
        feedback,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalFeedbacks: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error in getSellerFeedback:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @desc    Get feedback submitted by current user
// @route   GET /api/feedback/my-feedback
// @access  Private
const getMyFeedback = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const feedback = await Feedback.find({
      buyer: req.user._id,
    })
      .populate("product", "title images currentPrice")
      .populate("seller", "name profileImage")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Feedback.countDocuments({
      buyer: req.user._id,
    });

    res.status(200).json({
      success: true,
      data: {
        feedback,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalFeedbacks: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @desc    Get auctions won by user that need feedback
// @route   GET /api/feedback/pending
// @access  Private
const getPendingFeedback = asyncHandler(async (req, res) => {
  try {
    // Find won bids where feedback hasn't been submitted yet
    const wonBids = await Bid.find({
      bidder: req.user._id,
      status: "won",
    })
      .populate({
        path: "product",
        match: { status: "ended" },
        populate: {
          path: "vendor",
          select: "name profileImage",
        },
      })
      .sort({ updatedAt: -1 });

    // Filter out bids where product is null (didn't match the status filter)
    const validWonBids = wonBids.filter((bid) => bid.product !== null);

    // Check which ones don't have feedback yet
    const pendingFeedback = [];

    for (const bid of validWonBids) {
      const existingFeedback = await Feedback.findOne({
        product: bid.product._id,
        buyer: req.user._id,
      });

      if (!existingFeedback) {
        pendingFeedback.push({
          bid,
          product: bid.product,
          seller: bid.product.vendor,
          winAmount: bid.amount,
          auctionEndDate: bid.product.endTime,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: pendingFeedback,
      count: pendingFeedback.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @desc    Seller responds to feedback
// @route   PUT /api/feedback/:feedbackId/respond
// @access  Private (Sellers only)
const respondToFeedback = asyncHandler(async (req, res) => {
  const { response } = req.body;

  if (!response || response.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "Response cannot be empty",
    });
  }

  if (response.length > 500) {
    return res.status(400).json({
      success: false,
      error: "Response cannot exceed 500 characters",
    });
  }

  try {
    const feedback = await Feedback.findById(req.params.feedbackId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: "Feedback not found",
      });
    }

    // Verify the current user is the seller who received this feedback
    if (feedback.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You can only respond to feedback you received",
      });
    }

    // Check if already responded
    if (feedback.sellerResponse.response) {
      return res.status(400).json({
        success: false,
        error: "You have already responded to this feedback",
      });
    }

    feedback.sellerResponse = {
      response: response.trim(),
      respondedAt: new Date(),
    };

    await feedback.save();

    await feedback.populate([
      { path: "buyer", select: "name profileImage" },
      { path: "product", select: "title images" },
    ]);

    res.status(200).json({
      success: true,
      message: "Response submitted successfully",
      data: feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @desc    Get single feedback by ID
// @route   GET /api/feedback/:feedbackId
// @access  Public
const getFeedbackById = asyncHandler(async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.feedbackId)
      .populate("buyer", "name profileImage")
      .populate("seller", "name profileImage")
      .populate("product", "title images currentPrice startingPrice");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: "Feedback not found",
      });
    }

    // Only show active feedback to public, or any feedback to involved parties/admins
    const isInvolved =
      req.user &&
      (feedback.buyer._id.toString() === req.user._id.toString() ||
        feedback.seller._id.toString() === req.user._id.toString() ||
        req.user.role === "admin");

    if (feedback.status !== "active" && !isInvolved) {
      return res.status(404).json({
        success: false,
        error: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @desc    Flag feedback for moderation (Admin only)
// @route   PUT /api/feedback/:feedbackId/flag
// @access  Private (Admin only)
const flagFeedback = asyncHandler(async (req, res) => {
  const { moderationNotes } = req.body;

  try {
    const feedback = await Feedback.findById(req.params.feedbackId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: "Feedback not found",
      });
    }

    feedback.status = "flagged";
    feedback.moderationNotes = moderationNotes;
    feedback.moderatedBy = req.user._id;
    feedback.moderatedAt = new Date();

    await feedback.save();

    res.status(200).json({
      success: true,
      message: "Feedback flagged successfully",
      data: feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @desc    Get feedback statistics for dashboard
// @route   GET /api/feedback/stats/overview
// @access  Private (Admin only)
const getFeedbackStats = asyncHandler(async (req, res) => {
  try {
    const totalFeedback = await Feedback.countDocuments();
    const activeFeedback = await Feedback.countDocuments({ status: "active" });
    const flaggedFeedback = await Feedback.countDocuments({
      status: "flagged",
    });

    const averageRatings = await Feedback.aggregate([
      {
        $match: { status: "active" },
      },
      {
        $group: {
          _id: null,
          avgSellerRating: { $avg: "$sellerRating" },
          avgDeliveryRating: { $avg: "$deliveryRating" },
          recommendationRate: { $avg: { $cond: ["$wouldRecommend", 1, 0] } },
        },
      },
    ]);

    const stats = {
      totalFeedback,
      activeFeedback,
      flaggedFeedback,
      pendingModeration: flaggedFeedback,
      averageRatings:
        averageRatings.length > 0
          ? averageRatings[0]
          : {
              avgSellerRating: 0,
              avgDeliveryRating: 0,
              recommendationRate: 0,
            },
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
  submitFeedback,
  getProductFeedback,
  getSellerFeedback,
  getMyFeedback,
  getPendingFeedback,
  respondToFeedback,
  getFeedbackById,
  flagFeedback,
  getFeedbackStats,
};
