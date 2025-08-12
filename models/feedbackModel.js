const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    // The auction/product being reviewed
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // The buyer who won the auction and is leaving feedback
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The seller who listed the product
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The winning bid associated with this feedback
    winningBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bid",
      required: true,
    },

    // Product-specific feedback
    productRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: function (v) {
          return Number.isInteger(v);
        },
        message: "Product rating must be a whole number between 1 and 5",
      },
    },

    productReview: {
      type: String,
      required: true,
      maxlength: [1000, "Product review cannot exceed 1000 characters"],
      trim: true,
    },

    // Seller-specific feedback
    sellerRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: function (v) {
          return Number.isInteger(v);
        },
        message: "Seller rating must be a whole number between 1 and 5",
      },
    },

    sellerReview: {
      type: String,
      required: true,
      maxlength: [1000, "Seller review cannot exceed 1000 characters"],
      trim: true,
    },

    // Overall experience tags (optional)
    experienceTags: [
      {
        type: String,
        enum: [
          "fast_shipping",
          "excellent_packaging",
          "as_described",
          "good_communication",
          "professional_seller",
          "would_buy_again",
          "exceeded_expectations",
          "great_value",
          "quick_response",
          "helpful_seller",
        ],
      },
    ],

    // Issues or complaints (optional)
    issues: [
      {
        type: String,
        enum: [
          "late_delivery",
          "poor_packaging",
          "not_as_described",
          "poor_communication",
          "item_damaged",
          "quality_issues",
          "shipping_problems",
          "seller_unresponsive",
        ],
      },
    ],

    // Whether buyer would recommend this seller
    wouldRecommend: {
      type: Boolean,
      required: true,
    },

    // Delivery and transaction details
    deliveryRating: {
      type: Number,
      min: 1,
      max: 5,
      validate: {
        validator: function (v) {
          return v === null || Number.isInteger(v);
        },
        message: "Delivery rating must be a whole number between 1 and 5",
      },
    },

    // Whether the feedback is verified (buyer actually won the auction)
    isVerified: {
      type: Boolean,
      default: true,
    },

    // Status of the feedback
    status: {
      type: String,
      enum: ["active", "flagged", "hidden"],
      default: "active",
    },

    // Seller's response to the feedback (optional)
    sellerResponse: {
      response: {
        type: String,
        maxlength: [500, "Seller response cannot exceed 500 characters"],
        trim: true,
      },
      respondedAt: {
        type: Date,
      },
    },

    // Admin moderation
    moderationNotes: {
      type: String,
      maxlength: [500, "Moderation notes cannot exceed 500 characters"],
    },

    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    moderatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure one feedback per buyer per product
feedbackSchema.index({ product: 1, buyer: 1 }, { unique: true });

// Indexes for efficient querying
feedbackSchema.index({ seller: 1, status: 1, createdAt: -1 });
feedbackSchema.index({ product: 1, status: 1 });
feedbackSchema.index({ buyer: 1, createdAt: -1 });
feedbackSchema.index({ productRating: 1, sellerRating: 1 });
feedbackSchema.index({ isVerified: 1, status: 1 });

// Virtual for overall rating (average of product and seller ratings)
feedbackSchema.virtual("overallRating").get(function () {
  return Math.round(((this.productRating + this.sellerRating) / 2) * 10) / 10;
});

// Pre-save middleware to ensure only winners can leave feedback
feedbackSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      // Check if the buyer actually won this auction
      const Bid = require("./bidModel");
      const winningBid = await Bid.findOne({
        _id: this.winningBid,
        product: this.product,
        bidder: this.buyer,
        status: "won",
      });

      if (!winningBid) {
        const error = new Error("Only auction winners can leave feedback");
        error.status = 403;
        return next(error);
      }

      // Verify the seller is the product owner
      const Product = require("./productModel");
      const product = await Product.findById(this.product);
      if (!product || product.vendor.toString() !== this.seller.toString()) {
        const error = new Error("Invalid seller for this product");
        error.status = 400;
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Static method to get seller statistics
feedbackSchema.statics.getSellerStats = async function (sellerId) {
  const stats = await this.aggregate([
    {
      $match: {
        seller: mongoose.Types.ObjectId(sellerId),
        status: "active",
      },
    },
    {
      $group: {
        _id: null,
        totalFeedbacks: { $sum: 1 },
        averageProductRating: { $avg: "$productRating" },
        averageSellerRating: { $avg: "$sellerRating" },
        averageDeliveryRating: { $avg: "$deliveryRating" },
        recommendationRate: {
          $avg: { $cond: ["$wouldRecommend", 1, 0] },
        },
        ratingDistribution: {
          $push: {
            productRating: "$productRating",
            sellerRating: "$sellerRating",
          },
        },
      },
    },
  ]);

  if (stats.length === 0) {
    return {
      totalFeedbacks: 0,
      averageProductRating: 0,
      averageSellerRating: 0,
      averageDeliveryRating: 0,
      recommendationRate: 0,
      overallRating: 0,
    };
  }

  const result = stats[0];
  result.overallRating =
    Math.round(
      ((result.averageProductRating + result.averageSellerRating) / 2) * 10
    ) / 10;

  return result;
};

// Static method to get product feedback summary
feedbackSchema.statics.getProductStats = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: {
        product: mongoose.Types.ObjectId(productId),
        status: "active",
      },
    },
    {
      $group: {
        _id: null,
        totalFeedbacks: { $sum: 1 },
        averageProductRating: { $avg: "$productRating" },
        averageSellerRating: { $avg: "$sellerRating" },
        averageOverallRating: {
          $avg: { $divide: [{ $add: ["$productRating", "$sellerRating"] }, 2] },
        },
      },
    },
  ]);

  return stats.length > 0
    ? stats[0]
    : {
        totalFeedbacks: 0,
        averageProductRating: 0,
        averageSellerRating: 0,
        averageOverallRating: 0,
      };
};

module.exports = mongoose.model("Feedback", feedbackSchema);
