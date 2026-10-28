const mongoose = require('mongoose');

/**
 * Connect to MongoDB instance using URI from environment variables
 * Displays clear success and error messages without exposing sensitive credentials
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('❌ MongoDB Configuration Error: MONGODB_URI is not defined in environment variables.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });

    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error(`⚠️ MongoDB Connection Error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB Disconnected. Waiting for reconnection...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB Reconnected successfully.');
    });

  } catch (error) {
    console.error(`❌ MongoDB Initial Connection Failed: ${error.message}`);
    console.warn('⚠️ Note: Server is running. Ensure MongoDB daemon is active on the configured host/port.');
  }
};

module.exports = connectDB;
