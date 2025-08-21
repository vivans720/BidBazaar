const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Transaction = require("../models/transactionModel");
const Wallet = require("../models/walletModel");

// Load env vars
dotenv.config();

const removeDuplicateTransactions = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    console.log("🔍 Finding duplicate transactions...");

    // Find duplicate bid transactions
    const bidDuplicates = await Transaction.aggregate([
      {
        $match: {
          type: "bid",
          relatedBid: { $exists: true },
        },
      },
      {
        $group: {
          _id: { relatedBid: "$relatedBid", user: "$user" },
          count: { $sum: 1 },
          transactions: { $push: "$$ROOT" },
        },
      },
      {
        $match: { count: { $gt: 1 } },
      },
    ]);

    // Find duplicate deposit transactions (same user, amount, within 5 minutes)
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
            // Group by 5-minute intervals
            timeWindow: {
              $dateToString: {
                format: "%Y-%m-%d %H:%M",
                date: {
                  $dateFromParts: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                    day: { $dayOfMonth: "$createdAt" },
                    hour: { $hour: "$createdAt" },
                    minute: {
                      $multiply: [
                        { $floor: { $divide: [{ $minute: "$createdAt" }, 5] } },
                        5,
                      ],
                    },
                  },
                },
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
      `📊 Found ${bidDuplicates.length} groups of duplicate bid transactions`
    );
    console.log(
      `📊 Found ${depositDuplicates.length} groups of duplicate deposit transactions`
    );

    let totalRemoved = 0;
    let walletAdjustments = new Map(); // Track wallet balance adjustments

    // Process bid duplicates
    for (const duplicate of bidDuplicates) {
      const { transactions } = duplicate;
      console.log(
        `\n🔄 Processing bid duplicates for user ${duplicate._id.user}, bid ${duplicate._id.relatedBid}`
      );

      // Keep the oldest transaction and remove duplicates
      const sortedTransactions = transactions.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      const toKeep = sortedTransactions[0];
      const toRemove = sortedTransactions.slice(1);

      console.log(`✅ Keeping transaction: ${toKeep._id} (₹${toKeep.amount})`);

      for (const transaction of toRemove) {
        console.log(
          `❌ Removing duplicate: ${transaction._id} (₹${transaction.amount})`
        );

        // Track wallet adjustment
        const userId = transaction.user.toString();
        if (!walletAdjustments.has(userId)) {
          walletAdjustments.set(userId, 0);
        }
        walletAdjustments.set(
          userId,
          walletAdjustments.get(userId) + transaction.amount
        );

        await Transaction.findByIdAndDelete(transaction._id);
        totalRemoved++;
      }
    }

    // Process deposit duplicates
    for (const duplicate of depositDuplicates) {
      const { transactions } = duplicate;
      console.log(
        `\n🔄 Processing deposit duplicates for user ${duplicate._id.user}, amount ₹${duplicate._id.amount}`
      );

      // Keep the oldest transaction and remove duplicates
      const sortedTransactions = transactions.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      const toKeep = sortedTransactions[0];
      const toRemove = sortedTransactions.slice(1);

      console.log(`✅ Keeping transaction: ${toKeep._id} (₹${toKeep.amount})`);

      for (const transaction of toRemove) {
        console.log(
          `❌ Removing duplicate: ${transaction._id} (₹${transaction.amount})`
        );

        // Track wallet adjustment (subtract duplicate deposits)
        const userId = transaction.user.toString();
        if (!walletAdjustments.has(userId)) {
          walletAdjustments.set(userId, 0);
        }
        walletAdjustments.set(
          userId,
          walletAdjustments.get(userId) - transaction.amount
        );

        await Transaction.findByIdAndDelete(transaction._id);
        totalRemoved++;
      }
    }

    // Adjust wallet balances
    console.log(
      `\n💰 Adjusting wallet balances for ${walletAdjustments.size} users...`
    );

    for (const [userId, adjustment] of walletAdjustments) {
      if (adjustment !== 0) {
        const wallet = await Wallet.findOne({ user: userId });
        if (wallet) {
          const oldBalance = wallet.balance;
          wallet.balance += adjustment;

          // Ensure balance doesn't go negative
          if (wallet.balance < 0) {
            console.log(
              `⚠️ Warning: User ${userId} balance would be negative, setting to 0`
            );
            wallet.balance = 0;
          }

          await wallet.save();
          console.log(
            `💳 User ${userId}: ₹${oldBalance} → ₹${wallet.balance} (${
              adjustment > 0 ? "+" : ""
            }${adjustment})`
          );
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
  removeDuplicateTransactions();
}

module.exports = removeDuplicateTransactions;
