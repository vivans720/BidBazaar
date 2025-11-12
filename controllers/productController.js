const Product = require("../models/productModel");
const { validationResult } = require("express-validator");

// @desc    Create new product listing
// @route   POST /api/products
// @access  Private/Vendor
exports.createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Add vendor to req.body
    req.body.vendor = req.user.id;

    // Set placeholder times - will be recalculated when admin approves
    // Product starts in 'pending' status, auction timer starts only after admin approval
    const startTime = new Date();
    const endTime = new Date(
      startTime.getTime() + req.body.duration * 60 * 1000
    );
    req.body.startTime = startTime;
    req.body.endTime = endTime;

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
      message:
        "Product submitted for admin review. Auction will start after approval.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    // First, update any expired auctions
    await updateExpiredAuctions();

    const { category, status, sort, page = 1, limit = 10 } = req.query;
    const query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by status
    if (status) {
      query.status = status;
    } else {
      // By default, show only active products for public viewing
      query.status = "active";
    }

    // Sorting
    let sortQuery = {};
    if (sort) {
      switch (sort) {
        case "price-asc":
          sortQuery = { currentPrice: 1 };
          break;
        case "price-desc":
          sortQuery = { currentPrice: -1 };
          break;
        case "ending-soon":
          sortQuery = { endTime: 1 };
          break;
        default:
          sortQuery = { createdAt: -1 };
      }
    }

    const products = await Product.find(query)
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("vendor", "name");

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    // Populate both vendor and winner fields for complete sale information
    const product = await Product.findById(req.params.id)
      .populate("vendor", "name email")
      .populate("winner", "name email");

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Check if auction has expired and update status if needed
    const now = new Date();
    if (product.status === "active" && new Date(product.endTime) < now) {
      product.status = "ended";

      // Find the highest bidder and set them as the winner
      const Bid = require("../models/bidModel");
      const Wallet = require("../models/walletModel");
      const User = require("../models/userModel");
      const Transaction = require("../models/transactionModel");
      const highestBid = await Bid.findOne({ product: product._id })
        .sort({ amount: -1 })
        .populate("bidder", "name email");

      if (highestBid) {
        product.winner = highestBid.bidder._id;
        console.log(
          `Setting winner for product ${product._id} to ${highestBid.bidder.name}`
        );

        // Update the winning bid status to 'won'
        highestBid.status = "won";
        await highestBid.save();

        // Handle wallet transactions for auction end
        try {
          // Winner keeps their bid amount as final payment
          const winnerWallet = await Wallet.findOne({
            user: highestBid.bidder._id,
          });
          if (winnerWallet) {
            // Check if auction_win transaction already exists for this bid
            const existingWinTransaction = await Transaction.findOne({
              relatedBid: highestBid._id,
              type: "auction_win",
            });

            if (!existingWinTransaction) {
              // Record the final auction payment transaction
              await Transaction.create({
                wallet: winnerWallet._id,
                user: highestBid.bidder._id,
                type: "auction_win",
                amount: 0, // No additional deduction as bid amount was already deducted
                balanceAfter: winnerWallet.balance,
                description: `Won auction for product: ${
                  product.title || product.name
                }`,
                status: "completed",
                relatedProduct: product._id,
                relatedBid: highestBid._id,
              });
            }
          }

          // Refund all losing bidders (exclude ALL bids from the winning user)
          const losingBids = await Bid.find({
            product: product._id,
            bidder: { $ne: highestBid.bidder._id },
          });

          for (const losingBid of losingBids) {
            // Ensure loser wallet exists
            let loserWallet = await Wallet.findOne({ user: losingBid.bidder });
            if (!loserWallet) {
              loserWallet = await Wallet.create({
                user: losingBid.bidder,
                balance: 0,
                currency: "INR",
              });
            }

            // Determine exact refund from recorded bid transaction
            const bidTxn = await Transaction.findOne({
              relatedBid: losingBid._id,
              type: "bid",
              user: losingBid.bidder,
              status: "completed",
            });

            const refundAmount = bidTxn ? Math.abs(bidTxn.amount) : 0;
            if (refundAmount > 0) {
              await loserWallet.addFunds(
                refundAmount,
                "bid_refund",
                `Bid refund for ended auction: ${
                  product.title || product.name
                }`,
                losingBid._id,
                product._id
              );

              // Update user's cached balance
              await User.findByIdAndUpdate(losingBid.bidder, {
                walletBalance: loserWallet.balance,
              });
            }

            // Update losing bid status
            losingBid.status = "lost";
            await losingBid.save();
          }

          // Credit seller (vendor) with sale proceeds equal to winning bid (idempotent)
          try {
            const Product = require("../models/productModel");
            const updated = await Product.findOneAndUpdate(
              { _id: product._id, sellerPayoutCredited: { $ne: true } },
              { $set: { sellerPayoutCredited: true } },
              { new: true }
            );

            if (updated) {
              const vendorId = product.vendor;
              let vendorWallet = await Wallet.findOne({ user: vendorId });
              if (!vendorWallet) {
                vendorWallet = await Wallet.create({
                  user: vendorId,
                  balance: 0,
                  currency: "INR",
                });
              }

              await vendorWallet.addFunds(
                highestBid.amount,
                "sale_proceeds",
                `Sale proceeds for product: ${product.title || product.name}`,
                null,
                product._id
              );

              await User.findByIdAndUpdate(vendorId, {
                walletBalance: vendorWallet.balance,
              });
            }
          } catch (sellerCreditError) {
            console.error(
              "Error crediting seller with sale proceeds:",
              sellerCreditError
            );
          }
        } catch (walletError) {
          console.error(
            "Error handling wallet transactions for auction end:",
            walletError
          );
        }

        // Update all other bids for this product to 'lost'
        await Bid.updateMany(
          { product: product._id, _id: { $ne: highestBid._id } },
          { status: "lost" }
        );
      } else {
        console.log(`No bids found for product ${product._id}`);
      }

      await product.save();
      console.log(`Updated product ${product._id} status to ended`);
    }

    // Allow viewing of all products regardless of status
    // This ensures users can view auction results
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Vendor
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Make sure user is product vendor
    if (
      product.vendor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to update this product",
      });
    }

    // Don't allow updating certain fields after product is active
    if (product.status !== "pending") {
      const restrictedFields = ["startingPrice", "duration", "endTime"];
      const hasRestrictedFields = restrictedFields.some(
        (field) => req.body[field]
      );

      if (hasRestrictedFields) {
        return res.status(400).json({
          success: false,
          error: "Cannot update price or duration once product is active",
        });
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Vendor
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Make sure user is product vendor
    if (
      product.vendor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to delete this product",
      });
    }

    // Only allow deletion if product is pending or rejected
    if (!["pending", "rejected"].includes(product.status)) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete active or ended products",
      });
    }

    await product.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get vendor products
// @route   GET /api/products/vendor
// @access  Private/Vendor
exports.getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user.id })
      .sort({ endTime: -1, createdAt: -1 })
      .populate("winner", "name email")
      .populate("vendor", "name email");

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Review product (admin only)
// @route   PUT /api/products/:id/review
// @access  Private/Admin
exports.reviewProduct = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;

    if (!status || !["active", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid status (active or rejected)",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Only allow reviewing pending products
    if (product.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: `Cannot review ${product.status} products`,
      });
    }

    product.status = status;
    if (adminRemarks) {
      product.adminRemarks = adminRemarks;
    }

    // If product is approved (active), start the auction timer now
    if (status === "active") {
      const startTime = new Date();
      const endTime = new Date(
        startTime.getTime() + product.duration * 60 * 1000
      );
      product.startTime = startTime;
      product.endTime = endTime;
    }

    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Relist unsold product
// @route   POST /api/products/:id/relist
// @access  Private/Vendor
exports.relistProduct = async (req, res) => {
  try {
    const { startingPrice, duration } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Check if user is the vendor
    if (product.vendor.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to relist this product",
      });
    }

    // Check if product is eligible for relisting (ended without winner)
    if (product.status !== "ended" || product.winner) {
      return res.status(400).json({
        success: false,
        error: "Only unsold products can be relisted",
      });
    }

    // Calculate recommended price based on previous auction data
    const Bid = require("../models/bidModel");
    const previousBids = await Bid.find({ product: product._id }).sort({
      amount: -1,
    });

    let recommendedPrice = product.startingPrice;
    if (previousBids.length > 0) {
      // If there were bids, recommend 10-20% lower than the highest bid
      const highestBid = previousBids[0].amount;
      recommendedPrice = Math.max(
        Math.round(highestBid * 0.8), // 20% lower than highest bid
        Math.round(product.startingPrice * 0.9) // But not lower than 90% of original price
      );
    } else {
      // If no bids, recommend 10-15% lower than original price
      recommendedPrice = Math.round(product.startingPrice * 0.85);
    }

    // Create new product with updated details
    const newProduct = {
      title: product.title,
      description: product.description,
      category: product.category,
      startingPrice: startingPrice || recommendedPrice,
      duration: duration || product.duration,
      images: product.images,
      vendor: product.vendor,
    };

    // Set placeholder times - will be recalculated when admin approves
    const startTime = new Date();
    const endTime = new Date(
      startTime.getTime() + newProduct.duration * 60 * 1000
    );
    newProduct.startTime = startTime;
    newProduct.endTime = endTime;

    const relistedProduct = await Product.create(newProduct);

    res.status(201).json({
      success: true,
      data: relistedProduct,
      recommendedPrice,
      message: "Product relisted and submitted for admin review",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Remove unsold product
// @route   DELETE /api/products/:id/remove
// @access  Private/Vendor
exports.removeUnsoldProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Check if user is the vendor
    if (product.vendor.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to remove this product",
      });
    }

    // Check if product is eligible for removal (ended without winner)
    if (product.status !== "ended" || product.winner) {
      return res.status(400).json({
        success: false,
        error: "Only unsold products can be removed",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get price recommendation for relisting
// @route   GET /api/products/:id/price-recommendation
// @access  Private/Vendor
exports.getPriceRecommendation = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Check if user is the vendor
    if (product.vendor.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to access this product",
      });
    }

    // Check if product is eligible for relisting
    if (product.status !== "ended" || product.winner) {
      return res.status(400).json({
        success: false,
        error: "Only unsold products can be relisted",
      });
    }

    // Calculate recommended price based on previous auction data
    const Bid = require("../models/bidModel");
    const previousBids = await Bid.find({ product: product._id }).sort({
      amount: -1,
    });

    let recommendedPrice = product.startingPrice;
    let recommendationReason = "";

    if (previousBids.length > 0) {
      const highestBid = previousBids[0].amount;
      const averageBid =
        previousBids.reduce((sum, bid) => sum + bid.amount, 0) /
        previousBids.length;

      recommendedPrice = Math.max(
        Math.round(highestBid * 0.8), // 20% lower than highest bid
        Math.round(product.startingPrice * 0.9) // But not lower than 90% of original price
      );

      recommendationReason = `Based on ${
        previousBids.length
      } previous bids. Highest bid was ₹${highestBid}, average was ₹${Math.round(
        averageBid
      )}.`;
    } else {
      recommendedPrice = Math.round(product.startingPrice * 0.85);
      recommendationReason =
        "No bids received. Recommending 15% lower than original price to attract more interest.";
    }

    res.status(200).json({
      success: true,
      data: {
        originalPrice: product.startingPrice,
        recommendedPrice,
        recommendationReason,
        previousBidsCount: previousBids.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Utility function to check and update expired auctions
const updateExpiredAuctions = async (productsToCheck) => {
  const now = new Date();
  const Bid = require("../models/bidModel");

  // If we received specific products to check
  if (productsToCheck && Array.isArray(productsToCheck)) {
    for (const product of productsToCheck) {
      if (product.status === "active" && new Date(product.endTime) < now) {
        product.status = "ended";

        // Find the highest bidder and set them as the winner
        const highestBid = await Bid.findOne({ product: product._id })
          .sort({ amount: -1 })
          .populate("bidder", "name email");

        if (highestBid) {
          product.winner = highestBid.bidder._id;
          console.log(
            `Setting winner for product ${product._id} to ${highestBid.bidder.name}`
          );

          // Update the winning bid status to 'won'
          highestBid.status = "won";
          await highestBid.save();

          // Handle wallet transactions: record auction_win, refund losers, credit seller
          try {
            const Wallet = require("../models/walletModel");
            const User = require("../models/userModel");
            const Transaction = require("../models/transactionModel");

            // Winner finalization transaction (idempotent)
            const winnerWallet = await Wallet.findOne({
              user: highestBid.bidder._id,
            });
            if (winnerWallet) {
              const existingWinTransaction = await Transaction.findOne({
                relatedBid: highestBid._id,
                type: "auction_win",
              });
              if (!existingWinTransaction) {
                await Transaction.create({
                  wallet: winnerWallet._id,
                  user: highestBid.bidder._id,
                  type: "auction_win",
                  amount: 0,
                  balanceAfter: winnerWallet.balance,
                  description: `Won auction for product: ${
                    product.title || product.name
                  }`,
                  status: "completed",
                  relatedProduct: product._id,
                  relatedBid: highestBid._id,
                });
              }
            }

            // Refund all losing bidders
            const losingBids = await Bid.find({
              product: product._id,
              bidder: { $ne: highestBid.bidder._id },
            });

            for (const losingBid of losingBids) {
              let loserWallet = await Wallet.findOne({
                user: losingBid.bidder,
              });
              if (!loserWallet) {
                loserWallet = await Wallet.create({
                  user: losingBid.bidder,
                  balance: 0,
                  currency: "INR",
                });
              }

              const bidTxn = await Transaction.findOne({
                relatedBid: losingBid._id,
                type: "bid",
                user: losingBid.bidder,
                status: "completed",
              });
              const refundAmount = bidTxn ? Math.abs(bidTxn.amount) : 0;
              if (refundAmount > 0) {
                await loserWallet.addFunds(
                  refundAmount,
                  "bid_refund",
                  `Bid refund for ended auction: ${
                    product.title || product.name
                  }`,
                  losingBid._id,
                  product._id
                );

                await User.findByIdAndUpdate(losingBid.bidder, {
                  walletBalance: loserWallet.balance,
                });
              }

              losingBid.status = "lost";
              await losingBid.save();
            }

            // Credit seller proceeds (idempotent via product flag)
            try {
              const Product = require("../models/productModel");
              const updated = await Product.findOneAndUpdate(
                { _id: product._id, sellerPayoutCredited: { $ne: true } },
                { $set: { sellerPayoutCredited: true } },
                { new: true }
              );
              if (updated) {
                const vendorId = product.vendor;
                let vendorWallet = await Wallet.findOne({ user: vendorId });
                if (!vendorWallet) {
                  vendorWallet = await Wallet.create({
                    user: vendorId,
                    balance: 0,
                    currency: "INR",
                  });
                }
                await vendorWallet.addFunds(
                  highestBid.amount,
                  "sale_proceeds",
                  `Sale proceeds for product: ${product.title || product.name}`,
                  null,
                  product._id
                );
                await User.findByIdAndUpdate(vendorId, {
                  walletBalance: vendorWallet.balance,
                });
              }
            } catch (sellerCreditError) {
              console.error(
                "Error crediting seller with sale proceeds:",
                sellerCreditError
              );
            }
          } catch (walletError) {
            console.error(
              "Error handling wallet transactions for auction end:",
              walletError
            );
          }

          // Update all other bids for this product to 'lost'
          await Bid.updateMany(
            { product: product._id, _id: { $ne: highestBid._id } },
            { status: "lost" }
          );
        } else {
          console.log(`No bids found for product ${product._id}`);
        }

        await product.save();
        console.log(`Updated product ${product._id} status to ended`);
      }
    }
    return productsToCheck;
  }

  // If no specific products provided, update all expired active products in the database
  const expiredProducts = await Product.find({
    status: "active",
    endTime: { $lt: now },
  });

  console.log(`Found ${expiredProducts.length} expired auctions to update`);

  for (const product of expiredProducts) {
    product.status = "ended";

    // Find the highest bidder and set them as the winner
    const highestBid = await Bid.findOne({ product: product._id })
      .sort({ amount: -1 })
      .populate("bidder", "name email");

    if (highestBid) {
      product.winner = highestBid.bidder._id;
      console.log(
        `Setting winner for product ${product._id} to ${highestBid.bidder.name}`
      );

      // Update the winning bid status to 'won'
      highestBid.status = "won";
      await highestBid.save();

      // Handle wallet transactions: record auction_win, refund losers, credit seller
      try {
        const Wallet = require("../models/walletModel");
        const User = require("../models/userModel");
        const Transaction = require("../models/transactionModel");

        const winnerWallet = await Wallet.findOne({
          user: highestBid.bidder._id,
        });
        if (winnerWallet) {
          const existingWinTransaction = await Transaction.findOne({
            relatedBid: highestBid._id,
            type: "auction_win",
          });
          if (!existingWinTransaction) {
            await Transaction.create({
              wallet: winnerWallet._id,
              user: highestBid.bidder._id,
              type: "auction_win",
              amount: 0,
              balanceAfter: winnerWallet.balance,
              description: `Won auction for product: ${
                product.title || product.name
              }`,
              status: "completed",
              relatedProduct: product._id,
              relatedBid: highestBid._id,
            });
          }
        }

        const losingBids = await Bid.find({
          product: product._id,
          bidder: { $ne: highestBid.bidder._id },
        });

        for (const losingBid of losingBids) {
          let loserWallet = await Wallet.findOne({ user: losingBid.bidder });
          if (!loserWallet) {
            loserWallet = await Wallet.create({
              user: losingBid.bidder,
              balance: 0,
              currency: "INR",
            });
          }

          const bidTxn = await Transaction.findOne({
            relatedBid: losingBid._id,
            type: "bid",
            user: losingBid.bidder,
            status: "completed",
          });
          const refundAmount = bidTxn ? Math.abs(bidTxn.amount) : 0;
          if (refundAmount > 0) {
            await loserWallet.addFunds(
              refundAmount,
              "bid_refund",
              `Bid refund for ended auction: ${product.title || product.name}`,
              losingBid._id,
              product._id
            );

            await User.findByIdAndUpdate(losingBid.bidder, {
              walletBalance: loserWallet.balance,
            });
          }

          losingBid.status = "lost";
          await losingBid.save();
        }

        // Credit seller proceeds (idempotent via product flag)
        try {
          const Product = require("../models/productModel");
          const updated = await Product.findOneAndUpdate(
            { _id: product._id, sellerPayoutCredited: { $ne: true } },
            { $set: { sellerPayoutCredited: true } },
            { new: true }
          );
          if (updated) {
            const vendorId = product.vendor;
            let vendorWallet = await Wallet.findOne({ user: vendorId });
            if (!vendorWallet) {
              vendorWallet = await Wallet.create({
                user: vendorId,
                balance: 0,
                currency: "INR",
              });
            }
            await vendorWallet.addFunds(
              highestBid.amount,
              "sale_proceeds",
              `Sale proceeds for product: ${product.title || product.name}`,
              null,
              product._id
            );
            await User.findByIdAndUpdate(vendorId, {
              walletBalance: vendorWallet.balance,
            });
          }
        } catch (sellerCreditError) {
          console.error(
            "Error crediting seller with sale proceeds:",
            sellerCreditError
          );
        }
      } catch (walletError) {
        console.error(
          "Error handling wallet transactions for auction end:",
          walletError
        );
      }

      // Update all other bids for this product to 'lost'
      await Bid.updateMany(
        { product: product._id, _id: { $ne: highestBid._id } },
        { status: "lost" }
      );
    } else {
      console.log(`No bids found for product ${product._id}`);
    }

    await product.save();
    console.log(`Updated product ${product._id} status to ended`);
  }

  return expiredProducts;
};

// @desc    Get product statistics
// @route   GET /api/products/stats
// @access  Public
exports.getProductStats = async (req, res) => {
  try {
    // Update expired auctions first
    await updateExpiredAuctions();

    // Get total products count
    const totalProducts = await Product.countDocuments();

    // Get active auctions count
    const activeAuctions = await Product.countDocuments({
      status: "active",
    });

    // Get ended auctions count
    const endedAuctions = await Product.countDocuments({
      status: "ended",
    });

    // Get pending products count
    const pendingProducts = await Product.countDocuments({
      status: "pending",
    });

    // Get products with winners (successful auctions)
    const successfulAuctions = await Product.countDocuments({
      status: "ended",
      winner: { $exists: true, $ne: null },
    });

    // Get category distribution
    const categoryStats = await Product.aggregate([
      { $match: { status: { $ne: "rejected" } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get total users count (vendors and buyers)
    const User = require("../models/userModel");
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
    const totalVendors = await User.countDocuments({ role: "vendor" });
    const totalBuyers = await User.countDocuments({ role: "buyer" });

    // Get average auction duration for active auctions
    const avgDuration = await Product.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: null, avgDuration: { $avg: "$duration" } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalProducts,
        active: activeAuctions,
        ended: endedAuctions,
        pending: pendingProducts,
        successful: successfulAuctions,
        categories: categoryStats,
        users: {
          total: totalUsers,
          vendors: totalVendors,
          buyers: totalBuyers,
        },
        averageDuration:
          avgDuration.length > 0 ? Math.round(avgDuration[0].avgDuration) : 24,
      },
    });
  } catch (error) {
    console.error("Error fetching product stats:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

module.exports = {
  createProduct: exports.createProduct,
  getProducts: exports.getProducts,
  getProduct: exports.getProduct,
  updateProduct: exports.updateProduct,
  deleteProduct: exports.deleteProduct,
  getVendorProducts: exports.getVendorProducts,
  reviewProduct: exports.reviewProduct,
  relistProduct: exports.relistProduct,
  removeUnsoldProduct: exports.removeUnsoldProduct,
  getPriceRecommendation: exports.getPriceRecommendation,
  getProductStats: exports.getProductStats,
};
