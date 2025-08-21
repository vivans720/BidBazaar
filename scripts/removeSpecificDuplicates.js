const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Transaction = require("../models/transactionModel");
const Wallet = require("../models/walletModel");
const User = require("../models/userModel");

// Load env vars
dotenv.config();

const removeSpecificDuplicates = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    console.log("🔍 Finding specific duplicate transactions...");

    // Find duplicates based on description pattern
    const duplicateGroups = await Transaction.aggregate([
      {
        $group: {
          _id: {
            user: "$user",
            description: "$description",
            amount: "$amount",
            type: "$type",
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
      `Found ${duplicateGroups.length} groups of duplicate transactions`
    );

    let totalRemoved = 0;
    let walletAdjustments = new Map();

    for (const group of duplicateGroups) {
      const { transactions } = group;
      const { user, description, amount, type } = group._id;

      console.log(`\n🔄 Processing duplicates:`);
      console.log(`   User: ${user}`);
      console.log(`   Description: "${description}"`);
      console.log(`   Amount: ₹${amount}, Type: ${type}`);
      console.log(`   Count: ${group.count} transactions`);

      // Sort by creation time, keep the oldest
      const sortedTransactions = transactions.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      const toKeep = sortedTransactions[0];
      const toRemove = sortedTransactions.slice(1);

      console.log(
        `   ✅ Keeping: ${toKeep._id} (created: ${toKeep.createdAt})`
      );

      for (const transaction of toRemove) {
        console.log(
          `   ❌ Removing: ${transaction._id} (created: ${transaction.createdAt})`
        );

        // Calculate wallet adjustment needed
        const userId = transaction.user.toString();
        if (!walletAdjustments.has(userId)) {
          walletAdjustments.set(userId, {
            totalAdjustment: 0,
            details: [],
          });
        }

        const userAdjustment = walletAdjustments.get(userId);

        // For duplicate transactions, we need to reverse their effect
        if (type === "deposit") {
          // Remove the duplicate deposit amount
          userAdjustment.totalAdjustment -= amount;
          userAdjustment.details.push(`Remove duplicate deposit: -₹${amount}`);
        } else if (type === "bid") {
          // Add back the duplicate bid deduction (since amount is negative for bids)
          userAdjustment.totalAdjustment -= amount; // amount is already negative
          userAdjustment.details.push(
            `Refund duplicate bid: +₹${Math.abs(amount)}`
          );
        } else if (type === "auction_win") {
          // These are usually ₹0, no adjustment needed
          userAdjustment.details.push(
            `Remove duplicate auction_win: ₹${amount}`
          );
        }

        walletAdjustments.set(userId, userAdjustment);

        // Remove the duplicate transaction
        await Transaction.findByIdAndDelete(transaction._id);
        totalRemoved++;
      }
    }

    // Apply wallet adjustments
    console.log(
      `\n💰 Applying wallet adjustments for ${walletAdjustments.size} users...`
    );

    for (const [userId, adjustment] of walletAdjustments) {
      if (adjustment.totalAdjustment !== 0) {
        const user = await User.findById(userId);
        const wallet = await Wallet.findOne({ user: userId });

        if (wallet && user) {
          const oldBalance = wallet.balance;
          wallet.balance += adjustment.totalAdjustment;

          // Ensure balance doesn't go negative
          if (wallet.balance < 0) {
            console.log(
              `⚠️ Warning: User ${user.name} balance would be negative (${wallet.balance}), setting to 0`
            );
            wallet.balance = 0;
          }

          await wallet.save();

          console.log(`💳 ${user.name} (${user.email}):`);
          console.log(`   Old Balance: ₹${oldBalance}`);
          console.log(`   New Balance: ₹${wallet.balance}`);
          console.log(
            `   Adjustment: ${adjustment.totalAdjustment > 0 ? "+" : ""}₹${
              adjustment.totalAdjustment
            }`
          );
          console.log(`   Details: ${adjustment.details.join(", ")}`);

          // Update user's cached balance
          await User.findByIdAndUpdate(userId, {
            walletBalance: wallet.balance,
          });
        }
      }
    }

    console.log(`\n✅ Cleanup completed!`);
    console.log(`📈 Removed ${totalRemoved} duplicate transactions`);
    console.log(`💰 Adjusted ${walletAdjustments.size} wallet balances`);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

// Run the cleanup
if (require.main === module) {
  removeSpecificDuplicates();
}

module.exports = removeSpecificDuplicates;
