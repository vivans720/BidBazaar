const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("../models/productModel");
const Bid = require("../models/bidModel");
const Wallet = require("../models/walletModel");
const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");

// Load env vars
dotenv.config();

const fixWinnerRefunds = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find all ended auctions that have winners
    console.log("Finding ended auctions with winners...");
    const endedAuctions = await Product.find({
      status: "ended",
      winner: { $exists: true },
    }).populate("winner", "name email");

    console.log(`Found ${endedAuctions.length} ended auctions with winners`);

    let fixedCount = 0;

    for (const auction of endedAuctions) {
      console.log(
        `\nChecking auction: ${auction.title} (Winner: ${auction.winner.name})`
      );

      // Find the winning bid
      const winningBid = await Bid.findOne({
        product: auction._id,
        bidder: auction.winner._id,
        status: "won",
      }).sort({ amount: -1 });

      if (!winningBid) {
        console.log(`No winning bid found for auction ${auction._id}`);
        continue;
      }

      // Check if winner received any incorrect bid_refund
      const incorrectRefunds = await Transaction.find({
        user: auction.winner._id,
        type: "bid_refund",
        relatedProduct: auction._id,
        status: "completed",
      });

      if (incorrectRefunds.length > 0) {
        console.log(
          `Found ${incorrectRefunds.length} incorrect refunds for winner ${auction.winner.name}`
        );

        const winnerWallet = await Wallet.findOne({ user: auction.winner._id });
        if (!winnerWallet) {
          console.log(`Winner wallet not found for ${auction.winner.name}`);
          continue;
        }

        let totalIncorrectRefund = 0;

        for (const refund of incorrectRefunds) {
          console.log(
            `Removing incorrect refund: ₹${refund.amount} (Transaction: ${refund._id})`
          );
          totalIncorrectRefund += refund.amount;

          // Delete the incorrect refund transaction
          await Transaction.findByIdAndDelete(refund._id);
        }

        // Deduct the incorrectly refunded amount from winner's wallet
        winnerWallet.balance -= totalIncorrectRefund;
        winnerWallet.lastTransaction = new Date();
        await winnerWallet.save();

        // Update user's cached balance
        await User.findByIdAndUpdate(auction.winner._id, {
          walletBalance: winnerWallet.balance,
        });

        // Create a correction transaction
        await Transaction.create({
          wallet: winnerWallet._id,
          user: auction.winner._id,
          type: "admin_adjustment",
          amount: -totalIncorrectRefund,
          balanceAfter: winnerWallet.balance,
          description: `Correction: Removed incorrect bid refund for won auction: ${auction.title}`,
          status: "completed",
          relatedProduct: auction._id,
          paymentMethod: "admin",
        });

        console.log(
          `Fixed winner ${auction.winner.name}: Removed ₹${totalIncorrectRefund} incorrect refund`
        );
        fixedCount++;
      } else {
        console.log(
          `No incorrect refunds found for winner ${auction.winner.name}`
        );
      }
    }

    console.log(
      `\nCompleted! Fixed ${fixedCount} winners who had incorrect refunds.`
    );
  } catch (error) {
    console.error("Error fixing winner refunds:", error);
  } finally {
    mongoose.connection.close();
    console.log("\nDatabase connection closed");
  }
};

// Run the fix
fixWinnerRefunds();
