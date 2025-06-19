// Simplified logging utility for development
// Fallback when Winston has issues

const config = require('../config/environment');

// Simple console-based logger
const Log = {
    // Debug logs (like Android Log.d)
    d: (tag, message, meta = {}) => {
        if (config.isDevelopment) {
            console.log(`🐛 [DEBUG][${tag}] ${message}`, meta);
        }
    },

    // Info logs (like Android Log.i)  
    i: (tag, message, meta = {}) => {
        console.log(`ℹ️  [INFO][${tag}] ${message}`, meta);
    },

    // Warning logs (like Android Log.w)
    w: (tag, message, meta = {}) => {
        console.warn(`⚠️  [WARN][${tag}] ${message}`, meta);
    },

    // Error logs (like Android Log.e)
    e: (tag, message, error = null, meta = {}) => {
        const errorInfo = error ? { 
            error: error.message, 
            stack: error.stack,
            ...meta 
        } : meta;
        console.error(`❌ [ERROR][${tag}] ${message}`, errorInfo);
    },

    // HTTP request logs
    http: (tag, message, meta = {}) => {
        console.log(`🌐 [HTTP][${tag}] ${message}`, meta);
    },

    // Security-related logs
    security: (tag, message, meta = {}) => {
        console.warn(`🔒 [SECURITY][${tag}] ${message}`, {
            type: 'security',
            timestamp: new Date().toISOString(),
            ...meta
        });
    },

    // Performance monitoring logs
    performance: (tag, message, duration, meta = {}) => {
        console.log(`⚡ [PERFORMANCE][${tag}] ${message}`, {
            type: 'performance',
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
            ...meta
        });
    },

    // Database operation logs
    database: (tag, message, meta = {}) => {
        console.log(`🗄️  [DATABASE][${tag}] ${message}`, {
            type: 'database',
            timestamp: new Date().toISOString(),
            ...meta
        });
    },

    // Business logic logs
    business: (tag, message, meta = {}) => {
        console.log(`💼 [BUSINESS][${tag}] ${message}`, {
            type: 'business',
            timestamp: new Date().toISOString(),
            ...meta
        });
    }
};

// Stream for Morgan HTTP logging integration
const morganStream = {
    write: (message) => {
        console.log(`🌐 [HTTP] ${message.trim()}`);
    }
};

// Utility function to create request context logger
const createRequestLogger = (requestId, ip, userAgent) => {
    const context = { requestId, ip, userAgent };
    
    return {
        d: (tag, message, meta = {}) => Log.d(tag, message, { ...context, ...meta }),
        i: (tag, message, meta = {}) => Log.i(tag, message, { ...context, ...meta }),
        w: (tag, message, meta = {}) => Log.w(tag, message, { ...context, ...meta }),
        e: (tag, message, error = null, meta = {}) => Log.e(tag, message, error, { ...context, ...meta }),
        http: (tag, message, meta = {}) => Log.http(tag, message, { ...context, ...meta }),
        security: (tag, message, meta = {}) => Log.security(tag, message, { ...context, ...meta }),
        performance: (tag, message, duration, meta = {}) => Log.performance(tag, message, duration, { ...context, ...meta }),
        database: (tag, message, meta = {}) => Log.database(tag, message, { ...context, ...meta }),
        business: (tag, message, meta = {}) => Log.business(tag, message, { ...context, ...meta })
    };
};

// Simple winston-compatible logger for backward compatibility
const logger = {
    debug: (message, meta) => Log.d('Winston', message, meta),
    info: (message, meta) => Log.i('Winston', message, meta),
    warn: (message, meta) => Log.w('Winston', message, meta),
    error: (message, meta) => Log.e('Winston', message, null, meta),
    http: (message, meta) => Log.http('Winston', message, meta)
};

module.exports = {
    logger,
    Log,
    morganStream,
    createRequestLogger
};
