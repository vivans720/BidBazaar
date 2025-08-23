const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Product = require('./models/productModel');

async function checkExpiredAuctions() {
  try {
    console.log('Checking for expired auctions...');
    
    // Get all products with status 'ended'
    const expiredProducts = await Product.find({ status: 'ended' })
      .select('title status endTime currentPrice startingPrice')
      .limit(10);
    
    console.log(`Found ${expiredProducts.length} expired auctions:`);
    
    expiredProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
      console.log(`   Status: ${product.status}`);
      console.log(`   End Time: ${product.endTime}`);
      console.log(`   Final Price: ₹${product.currentPrice}`);
      console.log(`   Starting Price: ₹${product.startingPrice}`);
      console.log('');
    });
    
    // Also check all products to see total count
    const allProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    const endedProducts = await Product.countDocuments({ status: 'ended' });
    
    console.log(`Total products: ${allProducts}`);
    console.log(`Active products: ${activeProducts}`);
    console.log(`Ended products: ${endedProducts}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkExpiredAuctions();
