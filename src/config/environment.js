// Configuration module for environment-specific settings
const config = {
    // Environment
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
    
    // Security
    HTTPS_ONLY: process.env.HTTPS_ONLY === 'true',
    SESSION_SECRET: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
    
    // Database
    MONGODB_URI: process.env.MONGODB_URI,
    
    // Email
    EMAIL: {
        USER: process.env.EMAIL_USER,
        PASS: process.env.EMAIL_PASS,
        TO: process.env.EMAIL_TO
    },
    
    // API
    API_VERSION: process.env.API_VERSION || '1.0.0',
    
    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN?.split(',') || [
        'https://jeffkoretke.com',
        'https://www.jeffkoretke.com'
    ],
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
    LOG_FILE: process.env.LOG_FILE || 'logs/api.log',
    
    // Rate Limiting
    RATE_LIMIT: {
        WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
        MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
        CONTACT_MAX: parseInt(process.env.CONTACT_RATE_LIMIT_MAX) || 5
    },
    
    // Environment helpers
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
};

// Validation for required environment variables
const requiredEnvVars = ['MONGODB_URI'];

if (config.isProduction) {
    requiredEnvVars.push('EMAIL_USER', 'EMAIL_PASS', 'SESSION_SECRET');
}

// Check for missing required environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => {
    const keys = envVar.split('.');
    let value = process.env;
    for (const key of keys) {
        value = value?.[key];
    }
    return !value;
});

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    if (config.isProduction) {
        process.exit(1);
    }
}

module.exports = config;
