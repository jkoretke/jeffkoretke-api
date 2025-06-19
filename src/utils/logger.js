// Comprehensive logging utility using Winston
// Similar to Android's Log system but for server-side applications

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');
const config = require('../config/environment');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');

// Create logs directory if it doesn't exist
try {
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
} catch (error) {
    console.warn('Could not create logs directory:', error.message);
}

// Define log levels (similar to Android Log.d, Log.i, Log.w, Log.e)
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

// Define colors for console output
const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white'
};

winston.addColors(logColors);

// Custom format for console logging
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
    })
);

// Custom format for file logging (no colors)
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create transports based on environment
const createTransports = () => {
    const transports = [];

    // Console transport (always active)
    transports.push(
        new winston.transports.Console({
            level: config.isDevelopment ? 'debug' : 'info',
            format: consoleFormat
        })
    );

    // File transports for persistent logging (only if logs directory is writable)
    if (!config.isTest) {
        try {
            // Test if we can write to logs directory
            fs.accessSync(logsDir, fs.constants.W_OK);

            // General application logs with daily rotation
            transports.push(
                new DailyRotateFile({
                    filename: path.join(logsDir, 'application-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    maxSize: '20m',
                    maxFiles: '14d', // Keep logs for 14 days
                    level: 'info',
                    format: fileFormat,
                    handleExceptions: false,
                    handleRejections: false
                })
            );

            // Error logs (separate file for critical issues)
            transports.push(
                new DailyRotateFile({
                    filename: path.join(logsDir, 'error-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    maxSize: '20m',
                    maxFiles: '30d', // Keep error logs longer
                    level: 'error',
                    format: fileFormat,
                    handleExceptions: false,
                    handleRejections: false
                })
            );

            // HTTP access logs
            transports.push(
                new DailyRotateFile({
                    filename: path.join(logsDir, 'access-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    maxSize: '20m',
                    maxFiles: '7d', // Keep access logs for 7 days
                    level: 'http',
                    format: fileFormat,
                    handleExceptions: false,
                    handleRejections: false
                })
            );
        } catch (error) {
            console.warn('Cannot write to logs directory, using console only:', error.message);
        }
    }

    return transports;
};

// Create the main logger instance
const logger = winston.createLogger({
    levels: logLevels,
    level: config.LOG_LEVEL || 'info',
    format: fileFormat,
    transports: createTransports(),
    exitOnError: false
});

// Only add exception/rejection handlers if we can write to logs directory
try {
    fs.accessSync(logsDir, fs.constants.W_OK);
    
    // Handle uncaught exceptions and unhandled rejections
    logger.exceptions.handle(
        new winston.transports.File({ 
            filename: path.join(logsDir, 'exceptions.log'),
            format: fileFormat
        })
    );
    
    logger.rejections.handle(
        new winston.transports.File({ 
            filename: path.join(logsDir, 'rejections.log'),
            format: fileFormat
        })
    );
} catch (error) {
    console.warn('Cannot setup exception/rejection file handlers:', error.message);
}

// Custom logging methods similar to Android Log
const Log = {
    // Debug logs (like Android Log.d)
    d: (tag, message, meta = {}) => {
        logger.debug(`[${tag}] ${message}`, meta);
    },

    // Info logs (like Android Log.i)  
    i: (tag, message, meta = {}) => {
        logger.info(`[${tag}] ${message}`, meta);
    },

    // Warning logs (like Android Log.w)
    w: (tag, message, meta = {}) => {
        logger.warn(`[${tag}] ${message}`, meta);
    },

    // Error logs (like Android Log.e)
    e: (tag, message, error = null, meta = {}) => {
        const errorMeta = error ? { 
            error: error.message, 
            stack: error.stack,
            ...meta 
        } : meta;
        logger.error(`[${tag}] ${message}`, errorMeta);
    },

    // HTTP request logs
    http: (tag, message, meta = {}) => {
        logger.http(`[${tag}] ${message}`, meta);
    },

    // Security-related logs
    security: (tag, message, meta = {}) => {
        logger.warn(`[SECURITY][${tag}] ${message}`, {
            type: 'security',
            timestamp: new Date().toISOString(),
            ...meta
        });
    },

    // Performance monitoring logs
    performance: (tag, message, duration, meta = {}) => {
        logger.info(`[PERFORMANCE][${tag}] ${message}`, {
            type: 'performance',
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
            ...meta
        });
    },

    // Database operation logs
    database: (tag, message, meta = {}) => {
        logger.info(`[DATABASE][${tag}] ${message}`, {
            type: 'database',
            timestamp: new Date().toISOString(),
            ...meta
        });
    },

    // Business logic logs
    business: (tag, message, meta = {}) => {
        logger.info(`[BUSINESS][${tag}] ${message}`, {
            type: 'business',
            timestamp: new Date().toISOString(),
            ...meta
        });
    }
};

// Stream for Morgan HTTP logging integration
const morganStream = {
    write: (message) => {
        logger.http(message.trim());
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

// Export both the winston logger and our custom Log interface
module.exports = {
    logger,
    Log,
    morganStream,
    createRequestLogger
};
