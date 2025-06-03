const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const connectDB = require('./src/config/database');

// Import rate limiting middleware
const { generalLimiter } = require('./src/middleware/rateLimiter');

// Connect to database
connectDB();

// Create Express app (like creating an Activity in Android)
const app = express();

// Port configuration - use environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// Middleware setup (like setting up interceptors in Android)
// Parse JSON requests
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Configure CORS to allow requests from your website
app.use(cors({
    origin: [
        'https://jeffkoretke.com',
        'https://www.jeffkoretke.com',
        'http://localhost:3000', // For local development
        'http://127.0.0.1:5500'  // For VS Code Live Server
    ],
    credentials: true
}));

// Apply general rate limiting to all requests
app.use(generalLimiter);

// Basic logging middleware (like Android's Log.d())
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Import routes
const contactRoutes = require('./src/routes/contactRoutes');
const docsRoutes = require('./src/routes/docsRoutes');
const utilityRoutes = require('./src/routes/utilityRoutes');
const aboutRoutes = require('./src/routes/aboutRoutes');
const skillsRoutes = require('./src/routes/skillsRoutes');

// Use routes
app.use('/api/contact', contactRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/isitnotfriday', utilityRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/skills', skillsRoutes);

// Health check endpoint (like a simple ping in Android)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'API is running successfully'
    });
});

// API info endpoint
app.get('/api/info', (req, res) => {
    res.json({
        name: 'jeffkoretke-api',
        version: '1.0.0',
        description: 'REST API for jeffkoretke.com',
        author: 'Jeff Koretke',
        documentation: '/api/docs',        endpoints: [
            'GET /api/health',
            'GET /api/info',
            'GET /api/docs',
            'POST /api/contact',
            'GET /api/contact',
            'GET /api/contact/:id',
            'GET /api/isitnotfriday',
            'GET /api/about',
            'GET /api/skills',
            'GET /api/skills/:category'
        ]
    });
});

// Basic root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to jeffkoretke.com API',
        documentation: '/api/info'
    });
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
        suggestion: 'Check /api/info for available endpoints'
    });
});

// Global error handler (like a try-catch in Android)
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Start the server (like calling setContentView() and starting your Activity)
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📋 API info: http://localhost:${PORT}/api/info`);
});

// Export app for testing purposes
module.exports = app;