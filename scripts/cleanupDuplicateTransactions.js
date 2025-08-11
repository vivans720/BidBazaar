const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Transaction = require("../models/transactionModel");

// Load env vars
dotenv.config();

const cleanupDuplicateTransactions = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find duplicate transactions based on relatedBid and type
    console.log("Finding duplicate transactions...");

    const duplicates = await Transaction.aggregate([
      {
        $match: {
          relatedBid: { $exists: true },
          type: { $in: ["bid", "bid_refund", "auction_win"] },
        },
      },
      {
        $group: {
          _id: { relatedBid: "$relatedBid", type: "$type" },
          count: { $sum: 1 },
          transactions: { $push: "$$ROOT" },
        },
      },
      {
        $match: { count: { $gt: 1 } },
      },
    ]);

    console.log(`Found ${duplicates.length} groups of duplicate transactions`);

    let totalRemoved = 0;

    for (const duplicate of duplicates) {
      const { transactions } = duplicate;
      console.log(
        `\nProcessing duplicates for bid ${duplicate._id.relatedBid}, type: ${duplicate._id.type}`
      );
      console.log(`Found ${transactions.length} duplicate transactions`);

      // Keep the oldest transaction (first created) and remove the rest
      const sortedTransactions = transactions.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      const toKeep = sortedTransactions[0];
      const toRemove = sortedTransactions.slice(1);

      console.log(
        `Keeping transaction: ${toKeep._id} (created: ${toKeep.createdAt})`
      );

      for (const transaction of toRemove) {
        console.log(
          `Removing duplicate transaction: ${transaction._id} (created: ${transaction.createdAt})`
        );
        await Transaction.findByIdAndDelete(transaction._id);
        totalRemoved++;
      }
    }

    console.log(
      `\nCleanup completed! Removed ${totalRemoved} duplicate transactions.`
    );

    // Also find and remove duplicate deposit transactions (same user, same amount, same timestamp)
    console.log("\nChecking for duplicate deposit transactions...");

    const depositDuplicates = await Transaction.aggregate([
      {
        $match: {
          type: "deposit",
        },
      },
      {
        $group: {
          _id: {
            user: "$user",
            amount: "$amount",
            description: "$description",
            // Group by same minute to catch rapid duplicates
            timestamp: {
              $dateToString: {
                format: "%Y-%m-%d %H:%M",
                date: "$createdAt",
              },
            },
          },
          count: { $sum: 1 },
          transactions: { $push: "$$ROOT" },
        },
      },
      {
        $match: { count: { $gt: 1 } },
      },
    ]);

    console.log(
      `Found ${depositDuplicates.length} groups of duplicate deposit transactions`
    );

    for (const duplicate of depositDuplicates) {
      const { transactions } = duplicate;
      console.log(
        `\nProcessing duplicate deposits for user ${duplicate._id.user}, amount: ${duplicate._id.amount}`
      );

      // Keep the oldest transaction and remove the rest
      const sortedTransactions = transactions.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      const toKeep = sortedTransactions[0];
      const toRemove = sortedTransactions.slice(1);

      console.log(`Keeping deposit transaction: ${toKeep._id}`);

      for (const transaction of toRemove) {
        console.log(
          `Removing duplicate deposit transaction: ${transaction._id}`
        );
        await Transaction.findByIdAndDelete(transaction._id);
        totalRemoved++;
      }
    }

    console.log(
      `\nFinal cleanup completed! Total removed: ${totalRemoved} duplicate transactions.`
    );
  } catch (error) {
    console.error("Error cleaning up duplicate transactions:", error);
  } finally {
    mongoose.connection.close();
    console.log("\nDatabase connection closed");
  }
};

// Run the cleanup
cleanupDuplicateTransactions();
