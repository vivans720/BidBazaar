// Script to fix the Samsung Galaxy Watch 5 Classic auction
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/productModel');
const Bid = require('./models/bidModel');
const User = require('./models/userModel');

async function fixAuction() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the product from the screenshot (Samsung Galaxy Watch 5 Classic)
    console.log('Looking for the smartwatch auction...');
    const smartwatch = await Product.findOne({
      status: 'ended',
      $or: [
        { name: { $regex: 'Smartwatch', $options: 'i' } },
        { name: { $regex: 'Smart watch', $options: 'i' } },
        { name: { $regex: 'samsung.*watch', $options: 'i' } },
        { description: { $regex: 'samsung.*galaxy.*watch', $options: 'i' } }
      ]
    });

    if (!smartwatch) {
      console.log('Smartwatch not found. Looking for ended auctions with price around 11000...');
      const endedProducts = await Product.find({ 
        status: 'ended',
        $or: [
          { currentPrice: 11000 },
          { startingPrice: 10000 }
        ]
      });
      
      if (endedProducts.length === 0) {
        console.log('No matching auctions found. Looking at all ended auctions...');
        const allEndedProducts = await Product.find({ status: 'ended' }).limit(10);
        
        if (allEndedProducts.length === 0) {
          console.log('No ended auctions found at all.');
          return;
        }
        
        console.log('All ended auctions:');
        for (const product of allEndedProducts) {
          console.log(`- ${product.name} (ID: ${product._id}, Price: ${product.currentPrice || product.startingPrice})`);
        }
        
        return;
      }
      
      console.log('Found ended auctions with price around 11000:');
      for (const product of endedProducts) {
        console.log(`- ${product.name} (ID: ${product._id}, Price: ${product.currentPrice || product.startingPrice})`);
      }
      
      if (endedProducts.length === 1) {
        const targetProduct = endedProducts[0];
        console.log(`Found a single match: ${targetProduct.name}`);
        await updateProductWinner(targetProduct);
      } else {
        console.log('Please run this script again with the specific product ID from the list above.');
      }
      
      return;
    }
    
    console.log(`Found smartwatch: ${smartwatch.name} with ID ${smartwatch._id}`);
    await updateProductWinner(smartwatch);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    setTimeout(() => {
      mongoose.connection.close();
      console.log('MongoDB connection closed.');
    }, 1000);
  }
}

async function updateProductWinner(product) {
  console.log('Looking for user "honey"...');
  const honeyUser = await User.findOne({ name: { $regex: 'honey', $options: 'i' } });
  
  if (!honeyUser) {
    console.log('User "honey" not found. Looking for users...');
    const users = await User.find({}).limit(10);
    
    if (users.length === 0) {
      console.log('No users found in the database.');
      return;
    }
    
    console.log('Available users:');
    for (const user of users) {
      console.log(`- ${user.name} (ID: ${user._id}, Email: ${user.email || 'No email'})`);
    }
    
    // Continue with the highest bidder instead
    console.log('\nLooking for highest bid on the product...');
    const highestBid = await Bid.findOne({ product: product._id }).sort({ amount: -1 });
    
    if (highestBid) {
      const bidder = await User.findById(highestBid.bidder);
      console.log(`Found highest bid: ${highestBid.amount} by ${bidder ? bidder.name : 'Unknown'}`);
      
      // Update the product winner
      product.winner = highestBid.bidder;
      await product.save();
      console.log(`Set product winner to user ID: ${highestBid.bidder}`);
      
      // Update bid status
      highestBid.status = 'won';
      await highestBid.save();
      console.log(`Updated highest bid status to 'won'`);
      
      // Update other bids
      const updateResult = await Bid.updateMany(
        { product: product._id, _id: { $ne: highestBid._id } },
        { $set: { status: 'lost' } }
      );
      console.log(`Updated ${updateResult.modifiedCount} other bids to 'lost'`);
      
      console.log('Auction updated successfully!');
    } else {
      console.log('No bids found for this product.');
    }
    return;
  }
  
  console.log(`Found user "honey" with ID: ${honeyUser._id}`);
  
  // Check for existing bid by honey
  console.log('Checking if honey has placed a bid on this product...');
  const honeyBid = await Bid.findOne({ 
    product: product._id, 
    bidder: honeyUser._id 
  });
  
  if (honeyBid) {
    console.log(`Found honey's bid: ${honeyBid.amount}`);
    
    // Update product winner
    product.winner = honeyUser._id;
    await product.save();
    console.log(`Set product winner to honey (ID: ${honeyUser._id})`);
    
    // Update bid status
    honeyBid.status = 'won';
    await honeyBid.save();
    console.log(`Updated honey's bid status to 'won'`);
    
    // Update other bids
    const updateResult = await Bid.updateMany(
      { product: product._id, _id: { $ne: honeyBid._id } },
      { $set: { status: 'lost' } }
    );
    console.log(`Updated ${updateResult.modifiedCount} other bids to 'lost'`);
  } else {
    console.log('No bid by honey found. Creating a winning bid...');
    
    // Create a new bid
    const newBid = new Bid({
      product: product._id,
      bidder: honeyUser._id,
      amount: product.currentPrice || 11000,
      status: 'won'
    });
    
    await newBid.save();
    console.log(`Created winning bid of ${newBid.amount}`);
    
    // Update product winner
    product.winner = honeyUser._id;
    await product.save();
    console.log(`Set product winner to honey (ID: ${honeyUser._id})`);
  }
  
  console.log('Auction updated successfully! Honey is now the winner.');
}

// Execute the script
fixAuction().then(() => {
  console.log('Script completed!');
}); 