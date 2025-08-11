const mongoose = require("mongoose");
const Transaction = require("./models/transactionModel");
require("dotenv").config();

const cleanupDuplicateTransactions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find duplicate transactions based on relatedBid and type
    const duplicates = await Transaction.aggregate([
      {
        $match: {
          relatedBid: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: {
            relatedBid: "$relatedBid",
            type: "$type",
          },
          count: { $sum: 1 },
          transactions: { $push: "$_id" },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    console.log(`Found ${duplicates.length} groups of duplicate transactions`);

    let totalRemoved = 0;

    for (const duplicate of duplicates) {
      // Keep the first transaction, remove the rest
      const transactionsToRemove = duplicate.transactions.slice(1);

      const result = await Transaction.deleteMany({
        _id: { $in: transactionsToRemove },
      });

      totalRemoved += result.deletedCount;
      console.log(
        `Removed ${result.deletedCount} duplicate transactions for relatedBid: ${duplicate._id.relatedBid}, type: ${duplicate._id.type}`
      );
    }

    console.log(
      `\nCleanup completed! Removed ${totalRemoved} duplicate transactions.`
    );

    // Verify the compound index exists
    const indexes = await Transaction.collection.indexes();
    const hasCompoundIndex = indexes.some(
      (index) =>
        index.key && index.key.relatedBid && index.key.type && index.unique
    );

    if (hasCompoundIndex) {
      console.log("✓ Compound index for duplicate prevention is in place");
    } else {
      console.log("⚠ Creating compound index for duplicate prevention...");
      await Transaction.collection.createIndex(
        { relatedBid: 1, type: 1 },
        { unique: true, sparse: true }
      );
      console.log("✓ Compound index created");
    }
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

cleanupDuplicateTransactions();
