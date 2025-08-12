// Temporary fix for Cloudinary TLS certificate issues
// Run this script to test Cloudinary connection and fix certificate issues

const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Configure Cloudinary with TLS fixes
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  force_version: false,
});

// Disable TLS certificate validation for development (NOT for production)
if (process.env.NODE_ENV === "development") {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
}

// Test Cloudinary connection
const testCloudinaryConnection = async () => {
  try {
    console.log("Testing Cloudinary connection...");

    // Test API connection
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary connection successful:", result);

    // Test configuration
    console.log("📋 Current Cloudinary config:");
    console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
    console.log(
      "API Key:",
      process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing"
    );
    console.log(
      "API Secret:",
      process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing"
    );

    return true;
  } catch (error) {
    console.error("❌ Cloudinary connection failed:", error.message);
    console.log("\n🔧 Suggested fixes:");
    console.log("1. Check your .env file has correct Cloudinary credentials");
    console.log("2. Verify your Cloudinary account is active");
    console.log(
      "3. Try updating the cloudinary package: npm update cloudinary"
    );
    console.log(
      "4. For development, set NODE_TLS_REJECT_UNAUTHORIZED=0 in your .env"
    );

    return false;
  }
};

// Run the test
testCloudinaryConnection();

module.exports = { testCloudinaryConnection };
