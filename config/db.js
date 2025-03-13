const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGO_URI ? 'Exists' : 'Missing');
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log('MongoDB connection test successful');
    
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    console.error('Error Details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    process.exit(1);
  }
};

module.exports = connectDB;