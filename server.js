const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import configuration
const config = require('./src/config/environment');

// Import database connection
const connectDB = require('./src/config/database');

// Import rate limiting middleware
const { generalLimiter } = require('./src/middleware/rateLimiter');

// Import security middleware
const { enforceHTTPS, additionalSecurityHeaders, sanitizeRequest, securityLogger } = require('./src/middleware/security');

// Import comprehensive logging and error handling
const { Log, morganStream } = require('./src/utils/simpleLogger');
const { 
    errorHandler, 
    notFoundHandler, 
    handleUncaughtExceptions,
    handleValidationResult 
} = require('./src/middleware/errorHandler');
const { requestLogger, metricsLogger } = require('./src/middleware/requestLogger');

// Initialize uncaught exception handlers
handleUncaughtExceptions();

// Initialize metrics collection
const metrics = metricsLogger();

// Connect to database
connectDB();

// Create Express app (like creating an Activity in Android)
const app = express();

// Port configuration - use environment variable or default to 3000
const PORT = config.PORT;

// Environment-specific configuration
const isProduction = config.isProduction;
const isDevelopment = config.isDevelopment;

// Security middleware - helmet.js for security headers
app.use(helmet({
    // Configure Content Security Policy
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"],
        },
    },
    // Configure HTTPS in production
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    // Prevent clickjacking
    frameguard: { action: 'deny' },
    // Prevent MIME type sniffing
    noSniff: true,
    // Disable X-Powered-By header
    hidePoweredBy: true,
    // Enable XSS protection
    xssFilter: true
}));

// Request logging with morgan - integrated with Winston
if (isProduction) {
    // Production: combined log format to Winston stream
    app.use(morgan('combined', { stream: morganStream }));
} else {
    // Development: more detailed custom format to Winston stream
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms :date[clf]', { stream: morganStream }));
}

// Comprehensive request/response logging middleware
app.use(requestLogger);

// Security middleware - HTTPS enforcement (must be early in middleware chain)
app.use(enforceHTTPS);

// Additional security headers
app.use(additionalSecurityHeaders);

// Security logging and monitoring
app.use(securityLogger);

// Middleware setup (like setting up interceptors in Android)
// Parse JSON requests
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Request sanitization (clean potentially dangerous input)
app.use(sanitizeRequest);

// Configure CORS to allow requests from your website
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        let allowedOrigins = [...config.CORS_ORIGIN];
        
        // In development, also allow localhost
        if (isDevelopment) {
            allowedOrigins.push(
                'http://localhost:3000',
                'http://127.0.0.1:5500',
                'http://localhost:5500',
                'http://localhost:8080'
            );
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Apply general rate limiting to all requests
app.use(generalLimiter);

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
        environment: config.NODE_ENV,
        version: config.API_VERSION,
        message: 'API is running successfully'
    });
});

// API info endpoint
app.get('/api/info', (req, res) => {
    res.json({
        name: 'jeffkoretke-api',
        version: config.API_VERSION,
        description: 'REST API for jeffkoretke.com',
        author: 'Jeff Koretke',
        environment: config.NODE_ENV,
        documentation: '/api/docs',
        endpoints: [
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

// 404 handler for undefined routes (replaced with comprehensive handler)
app.use(notFoundHandler);

// Global error handler (comprehensive error handling middleware)
app.use(errorHandler);

// Start the server (like calling setContentView() and starting your Activity)
const server = app.listen(PORT, () => {
    Log.i('Server', `🚀 Server running on port ${PORT}`);
    Log.i('Server', `🌍 Environment: ${config.NODE_ENV}`);
    Log.i('Server', `🛡️  Security: Helmet enabled`);
    Log.i('Server', `📝 Logging: Winston + Morgan enabled`);
    Log.i('Server', `📍 Health check: http://localhost:${PORT}/api/health`);
    Log.i('Server', `📋 API info: http://localhost:${PORT}/api/info`);
    
    if (isProduction) {
        Log.i('Server', `🔒 HTTPS enforcement enabled`);
        Log.i('Server', `🔐 Production security headers active`);
    } else {
        Log.i('Server', `🔧 Development mode - Enhanced logging enabled`);
    }
    
    // Start periodic metrics logging
    setInterval(() => {
        metrics.logPeriodic();
    }, 60000); // Log metrics every minute
});

// Export app for testing purposes
module.exports = app;