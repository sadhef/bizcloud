const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// CORS configuration for development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      '', // This allows requests with an empty origin, which can happen in some scenarios.
      process.env.FRONTEND_URL
    ].filter(Boolean); // Filter out any empty strings if FRONTEND_URL is not set

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: false, // Set to true if your frontend needs to send cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false, // Pass the preflight response to the next handler
  optionsSuccessStatus: 204 // For preflight requests, respond with 204 No Content
};

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Set to true if you need to control embedding of cross-origin resources
  contentSecurityPolicy: false // Set to a proper CSP policy in production
}));

// Apply CORS to all incoming requests
app.use(cors(corsOptions));

// Handle preflight requests explicitly for all routes using the defined corsOptions
app.options('*', cors(corsOptions));

// Rate limiting middleware to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter); // Apply rate limiting to all API routes

// Logging middleware (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev')); // 'dev' format for concise output
}

// Body parsing middleware to handle JSON and URL-encoded data
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies with a 10MB limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies with a 10MB limit

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://muhammedsadhef:RIFA123456@cluster0.7xpiu.mongodb.net/biztras', {
  useNewUrlParser: true, // Deprecated in newer Mongoose versions, but harmless
  useUnifiedTopology: true, // Deprecated in newer Mongoose versions, but harmless
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Import routes after database connection to ensure DB is ready
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const cloudReportRoutes = require('./routes/cloud-report');
const backupServerRoutes = require('./routes/backup-server');

// Define API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cloud-report', cloudReportRoutes);
app.use('/api/backup-server', backupServerRoutes);

// Health check endpoint for monitoring
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'BizTras API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling utilities
const { errorHandler, AppError } = require('./utils/errorHandler');

// 404 handler for undefined routes
app.all('*', (req, res, next) => {
  // Corrected template literal syntax
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = app;
