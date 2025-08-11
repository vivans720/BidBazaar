const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Wallet = require("../models/walletModel");

// Load env vars
dotenv.config();

const updateWalletCurrency = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Update all wallets to use INR currency
    const result = await Wallet.updateMany(
      { currency: { $ne: "INR" } }, // Find wallets that don't have INR
      { $set: { currency: "INR" } } // Set currency to INR
    );

    console.log(`Updated ${result.modifiedCount} wallets to use INR currency`);

    // List all wallets to verify
    const wallets = await Wallet.find({}).select("user currency balance");
    console.log("\nCurrent wallet currencies:");
    wallets.forEach((wallet) => {
      console.log(
        `Wallet ${wallet._id}: ${wallet.currency} - Balance: ${wallet.balance}`
      );
    });
  } catch (error) {
    console.error("Error updating wallet currencies:", error);
  } finally {
    mongoose.connection.close();
    console.log("\nDatabase connection closed");
  }
};

// Run the update
updateWalletCurrency();
