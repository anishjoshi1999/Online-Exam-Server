const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Timeout for socket connection
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't exit the process, just log the error
    console.log('Continuing without database connection...');
  }
};

module.exports = connectDB;
