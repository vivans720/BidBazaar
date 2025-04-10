const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const connectDB = require('./config/db');
const Product = require('./models/productModel');
const Bid = require('./models/bidModel');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const bidRoutes = require('./routes/bidRoutes');

const app = express();

// Body parser
app.use(express.json());

// File Upload
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: './tmp',
  debug: process.env.NODE_ENV === 'development',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  abortOnLimit: true,
  responseOnLimit: 'File size is too large. Maximum size is 5MB.',
  createParentPath: true,
}));

// Enable CORS
const clientURL = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(cors({
  origin: [clientURL, 'https://bidbazaar.pages.dev'],
  credentials: true
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Scheduled task to update expired auctions
const updateExpiredAuctions = async () => {
  const now = new Date();
  try {
    const expiredProducts = await Product.find({
      status: 'active',
      endTime: { $lt: now }
    });
    
    console.log(`Found ${expiredProducts.length} expired auctions to update`);
    
    for (const product of expiredProducts) {
      product.status = 'ended';
      
      // Find the highest bidder and set them as the winner
      const highestBid = await Bid.findOne({ product: product._id })
        .sort({ amount: -1 })
        .populate('bidder', 'name email');
      
      if (highestBid) {
        product.winner = highestBid.bidder._id;
        console.log(`Setting winner for product ${product._id} to ${highestBid.bidder.name}`);
        
        // Update the winning bid status to 'won'
        highestBid.status = 'won';
        await highestBid.save();
        
        // Update all other bids for this product to 'lost'
        await Bid.updateMany(
          { product: product._id, _id: { $ne: highestBid._id } },
          { status: 'lost' }
        );
      } else {
        console.log(`No bids found for product ${product._id}`);
      }
      
      await product.save();
      console.log(`Updated product ${product._id} status to ended`);
    }
  } catch (err) {
    console.error('Error updating expired auctions:', err);
  }
};

// Run immediately on startup
updateExpiredAuctions();

// Then schedule to run every 10 minutes
setInterval(updateExpiredAuctions, 10 * 60 * 1000);

// Mount routers
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/bids', bidRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Server is running...');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});