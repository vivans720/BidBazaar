const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const connectDB = require("./config/db");
const Product = require("./models/productModel");
const Bid = require("./models/bidModel");
const Wallet = require("./models/walletModel");
const User = require("./models/userModel");
const path = require("path");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const bidRoutes = require("./routes/bidRoutes");
const walletRoutes = require("./routes/walletRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

// Body parser
app.use(express.json());

// File Upload
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./tmp",
    debug: process.env.NODE_ENV === "development",
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    abortOnLimit: true,
    responseOnLimit: "File size is too large. Maximum size is 5MB.",
    createParentPath: true,
  })
);

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Enable CORS
const clientURL = process.env.CLIENT_URL || "http://localhost:3000";
app.use(
  cors({
    origin: [clientURL, "https://bidbazaar.pages.dev"],
    credentials: true,
  })
);

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Scheduled task to update expired auctions
const updateExpiredAuctions = async () => {
  const now = new Date();
  try {
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

        // Handle wallet transactions for auction end
        try {
          // Winner keeps their bid amount as final payment
          const winnerWallet = await Wallet.findOne({
            user: highestBid.bidder._id,
          });
          if (winnerWallet) {
            // Check if auction_win transaction already exists for this bid
            const Transaction = require("./models/transactionModel");
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

            // Refund exactly what was deducted for this bid (match transaction)
            const Transaction = require("./models/transactionModel");
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
            const Product = require("./models/productModel");
            // Atomically set payout flag to prevent duplicates across paths
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

              // Update vendor cached balance
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

        // Update all other bids for this product to 'lost' (fallback)
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
  } catch (err) {
    console.error("Error updating expired auctions:", err);
  }
};

// Run immediately on startup
updateExpiredAuctions();

// Then schedule to run every 10 minutes
setInterval(updateExpiredAuctions, 10 * 60 * 1000);

// Mount routers
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Test route for image files
app.get("/test-image", (req, res) => {
  const testImagePath = path.join(__dirname, "uploads/users");
  const fs = require("fs");
  fs.readdir(testImagePath, (err, files) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: "Error reading uploads directory",
        details: err.message,
      });
    }

    res.json({
      success: true,
      message: "Uploads directory contents",
      files,
      uploadPath: testImagePath,
      url: `${req.protocol}://${req.get("host")}/uploads/users/${
        files[0] || "no-files"
      }`,
    });
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || "Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
