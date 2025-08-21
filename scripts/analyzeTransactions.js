const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Transaction = require("../models/transactionModel");
const User = require("../models/userModel"); // Add this

// Load env vars
dotenv.config();

const analyzeTransactions = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    console.log("🔍 Analyzing transaction patterns...");

    // Find transactions that might be duplicates based on various criteria
    console.log(
      "\n📊 Checking for near-duplicate transactions (same user, amount, type within 1 hour):"
    );

    const nearDuplicates = await Transaction.aggregate([
      {
        $group: {
          _id: {
            user: "$user",
            amount: "$amount",
            type: "$type",
            // Group by hour
            hourWindow: {
              $dateToString: {
                format: "%Y-%m-%d %H",
                date: "$createdAt",
              },
            },
          },
          count: { $sum: 1 },
          transactions: { $push: "$$ROOT" },
          firstCreated: { $min: "$createdAt" },
          lastCreated: { $max: "$createdAt" },
        },
      },
      {
        $match: { count: { $gt: 1 } },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    console.log(
      `Found ${nearDuplicates.length} groups of potential near-duplicate transactions`
    );

    for (const group of nearDuplicates) {
      console.log(
        `\n📋 Group: User ${group._id.user}, Type: ${group._id.type}, Amount: ₹${group._id.amount}`
      );
      console.log(`   Count: ${group.count} transactions`);
      console.log(
        `   Time range: ${group.firstCreated} to ${group.lastCreated}`
      );

      // Show transaction details
      for (const txn of group.transactions) {
        console.log(
          `   - ${txn._id}: ${txn.createdAt} | Status: ${txn.status} | Balance: ₹${txn.balanceAfter}`
        );
      }
    }

    // Check for exact duplicate descriptions
    console.log("\n🔍 Checking for transactions with identical descriptions:");

    const duplicateDescriptions = await Transaction.aggregate([
      {
        $group: {
          _id: {
            user: "$user",
            description: "$description",
            amount: "$amount",
          },
          count: { $sum: 1 },
          transactions: { $push: "$$ROOT" },
        },
      },
      {
        $match: { count: { $gt: 1 } },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    console.log(
      `Found ${duplicateDescriptions.length} groups with identical descriptions`
    );

    for (const group of duplicateDescriptions.slice(0, 5)) {
      // Show top 5
      console.log(`\n📝 Description: "${group._id.description}"`);
      console.log(
        `   User: ${group._id.user}, Amount: ₹${group._id.amount}, Count: ${group.count}`
      );
    }

    // Check recent transactions for a specific user (if any)
    console.log("\n📅 Recent transactions (last 10):");
    const recentTransactions = await Transaction.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    for (const txn of recentTransactions) {
      console.log(
        `${txn.createdAt.toISOString()} | ${txn.user?.name || "Unknown"} | ${
          txn.type
        } | ₹${txn.amount} | ${txn.description}`
      );
    }
  } catch (error) {
    console.error("❌ Error during analysis:", error);
  } finally {
    mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

// Run the analysis
analyzeTransactions();
