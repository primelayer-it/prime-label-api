const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const strConn =
  process.env.NODE_ENV === 'production'
    ? process.env.MONGO_URI_PROD // Production DB connection string
    : process.env.MONGO_URI_DEV; // Development DB connection string

console.log('eLabel-API - ENVIRONMENT=' + process.env.NODE_ENV);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(strConn);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error =: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
