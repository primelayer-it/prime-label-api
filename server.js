const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const helmet = require('helmet'); // Security middleware
const fs = require('fs');
const path = require('path');
const morgan = require('morgan'); // HTTP request logger
const rfs = require('rotating-file-stream');
const { limiter, speedLimiter } = require('./middleware/rateLimiter');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// Link Routes
const labelRoutes = require('./routes/labelRoutes');

//middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();
const app = express();
// Protects against very large payloads DOS'ing your server.
app.use(express.json({ limit: '10kb' }));

// CORS configuration
const corsOptions = {
  origin: [
    'https://prime-label-frontend-x7uo.vercel.app/',
    'http://localhost:5173', // For local development
    'http://localhost:3000', // Alternative local port
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

//Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Sanitize request data to prevent NoSQL injection
//    This will remove any keys beginning with '$' or containing '.'
app.use(mongoSanitize());

// Protect against HTTP Parameter Pollution
//    (e.g. foo=1&foo=2 attacks)
app.use(
  hpp({
    whitelist: ['sort', 'fields'],
  }),
);

//security implementations !
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV !== 'development', // Enable CSP in production
    crossOriginEmbedderPolicy: process.env.NODE_ENV !== 'development',
  }),
);

// Setup Logging
// Ensure the 'logs' directory exists
const logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Create a rotating write stream
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  size: '10M', // rotate when log size reaches 10MB
  compress: 'gzip', // compress rotated files
  path: logDirectory,
});

// Setup morgan to log requests to the console and to a file
app.use(morgan('combined', { stream: accessLogStream }));

// RateLmiter & slowDown
app.use(limiter);
app.use(speedLimiter);

// Mount our API routes
app.use('/api/labels', labelRoutes);

// Fallbacks
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful Shutdown Handler
const handleShutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  try {
    // Stop accepting new connections
    server.close(() => {
      console.log('HTTP server closed.');

      // Close MongoDB connection
      mongoose.disconnect().then(() => {
        console.log('MongoDB connection closed.');
        process.exit(0); // Exit the process
      });
    });

    // If server.close() takes too long, force exit
    setTimeout(() => {
      console.error('Shutdown timed out. Forcing exit.');
      process.exit(1); // Force exit after timeout
    }, 10000); // 10 seconds timeout
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1); // Exit with error
  }
};

// Listen for Termination Signals
process.on('SIGINT', () => handleShutdown('SIGINT')); // Ctrl+C
process.on('SIGTERM', () => handleShutdown('SIGTERM')); // Docker/Kubernetes

//Look for uncaught exceptions and unhandled rejections
// This is a good place to log the error and perform cleanup if necessary
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception', err);
  handleShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection', reason);
  handleShutdown('unhandledRejection');
});
