// Comprehensive error handling middleware
// Similar to Android's exception handling but for Express.js

const { Log } = require('../utils/simpleLogger');
const config = require('../config/environment');

// Optional Sentry integration
let errorTracking = null;
try {
    errorTracking = require('../utils/errorTracking');
} catch (error) {
    // Sentry integration is optional
    console.log('Error tracking not available (optional)');
}

/**
 * Custom error classes for different types of errors
 * Similar to creating custom Exception classes in Android
 */

// Base API Error class
class APIError extends Error {
    constructor(message, statusCode = 500, isOperational = true, errorCode = null) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errorCode = errorCode;
        this.timestamp = new Date().toISOString();
        
        // Capture stack trace (similar to Android's stack traces)
        Error.captureStackTrace(this, this.constructor);
    }
}

// Validation Error
class ValidationError extends APIError {
    constructor(message, errors = []) {
        super(message, 400, true, 'VALIDATION_ERROR');
        this.errors = errors;
    }
}

// Authentication Error
class AuthenticationError extends APIError {
    constructor(message = 'Authentication required') {
        super(message, 401, true, 'AUTHENTICATION_ERROR');
    }
}

// Authorization Error
class AuthorizationError extends APIError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403, true, 'AUTHORIZATION_ERROR');
    }
}

// Not Found Error
class NotFoundError extends APIError {
    constructor(message = 'Resource not found') {
        super(message, 404, true, 'NOT_FOUND_ERROR');
    }
}

// Rate Limit Error
class RateLimitError extends APIError {
    constructor(message = 'Rate limit exceeded', retryAfter = null) {
        super(message, 429, true, 'RATE_LIMIT_ERROR');
        this.retryAfter = retryAfter;
    }
}

// Database Error
class DatabaseError extends APIError {
    constructor(message = 'Database operation failed', originalError = null) {
        super(message, 500, true, 'DATABASE_ERROR');
        this.originalError = originalError;
    }
}

// External Service Error
class ExternalServiceError extends APIError {
    constructor(message = 'External service unavailable', service = null) {
        super(message, 503, true, 'EXTERNAL_SERVICE_ERROR');
        this.service = service;
    }
}

/**
 * Error handling utilities
 */

// Check if error is operational (expected) or programming error
const isOperationalError = (error) => {
    if (error instanceof APIError) {
        return error.isOperational;
    }
    return false;
};

// Convert validation errors from express-validator to our format
const formatValidationErrors = (validationResult) => {
    const errors = validationResult.array();
    const formattedErrors = errors.map(error => ({
        type: error.type || 'field',
        message: error.msg,
        field: error.path || error.param,
        value: error.value,
        location: error.location
    }));
    
    return new ValidationError('Validation failed', formattedErrors);
};

// Handle different types of errors and convert them to APIError
const normalizeError = (error) => {
    // If it's already an APIError, return as is
    if (error instanceof APIError) {
        return error;
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError' && error.errors) {
        const validationErrors = Object.values(error.errors).map(err => ({
            type: 'field',
            message: err.message,
            field: err.path,
            value: err.value,
            location: 'body'
        }));
        return new ValidationError('Database validation failed', validationErrors);
    }

    // Handle Mongoose duplicate key errors
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return new ValidationError('Duplicate value error', [{
            type: 'field',
            message: `${field} already exists`,
            field: field,
            location: 'body'
        }]);
    }

    // Handle Mongoose CastError (invalid ObjectId)
    if (error.name === 'CastError') {
        return new ValidationError('Invalid ID format', [{
            type: 'field',
            message: 'Invalid ID format',
            field: error.path,
            value: error.value,
            location: 'params'
        }]);
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        return new AuthenticationError('Invalid token');
    }

    if (error.name === 'TokenExpiredError') {
        return new AuthenticationError('Token expired');
    }

    // Handle CORS errors
    if (error.message && error.message.includes('CORS')) {
        return new AuthorizationError('CORS policy violation');
    }

    // Default to internal server error
    return new APIError(
        config.isProduction ? 'Internal server error' : error.message,
        500,
        false,
        'INTERNAL_SERVER_ERROR'
    );
};

/**
 * Main error handling middleware
 * This should be the last middleware in your Express app
 */
const errorHandler = (error, req, res, next) => {
    const requestId = req.requestId || 'unknown';
    const requestLogger = req.logger || Log;

    // Normalize the error
    const normalizedError = normalizeError(error);

    // Log the error with appropriate level
    if (normalizedError.statusCode >= 500) {
        // Server errors - log as error with full details
        requestLogger.e(
            'ErrorHandler',
            `${normalizedError.message}`,
            normalizedError,
            {
                requestId,
                url: req.originalUrl,
                method: req.method,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                body: req.body,
                params: req.params,
                query: req.query,
                stack: normalizedError.stack
            }
        );

        // Send to error tracking service if available
        if (errorTracking && !normalizedError.isOperational) {
            errorTracking.captureError(normalizedError, {
                requestId,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                url: req.originalUrl,
                method: req.method,
                component: 'api'
            });
        }
    } else if (normalizedError.statusCode >= 400) {
        // Client errors - log as warning
        requestLogger.w(
            'ErrorHandler',
            `Client error: ${normalizedError.message}`,
            {
                requestId,
                statusCode: normalizedError.statusCode,
                errorCode: normalizedError.errorCode,
                url: req.originalUrl,
                method: req.method,
                ip: req.ip
            }
        );
    }

    // Security logging for suspicious activity
    if (normalizedError.statusCode === 401 || normalizedError.statusCode === 403) {
        requestLogger.security(
            'ErrorHandler',
            `Security violation: ${normalizedError.message}`,
            {
                requestId,
                statusCode: normalizedError.statusCode,
                url: req.originalUrl,
                method: req.method,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            }
        );
    }

    // Prepare response
    const errorResponse = {
        success: false,
        error: {
            message: normalizedError.message,
            code: normalizedError.errorCode,
            statusCode: normalizedError.statusCode,
            timestamp: normalizedError.timestamp,
            requestId
        }
    };

    // Add validation errors if present
    if (normalizedError instanceof ValidationError && normalizedError.errors) {
        errorResponse.error.details = normalizedError.errors;
    }

    // Add retry after for rate limit errors
    if (normalizedError instanceof RateLimitError && normalizedError.retryAfter) {
        errorResponse.error.retryAfter = normalizedError.retryAfter;
        res.set('Retry-After', normalizedError.retryAfter);
    }

    // In development, include stack trace for debugging
    if (config.isDevelopment && normalizedError.stack) {
        errorResponse.error.stack = normalizedError.stack;
    }

    // Send the error response
    res.status(normalizedError.statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 * Should be placed before the error handler
 */
const notFoundHandler = (req, res, next) => {
    const requestLogger = req.logger || Log;
    
    requestLogger.w(
        'NotFound',
        `Route not found: ${req.method} ${req.originalUrl}`,
        {
            requestId: req.requestId,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        }
    );

    const error = new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`);
    next(error);
};

/**
 * Async error wrapper
 * Wraps async route handlers to automatically catch rejected promises
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Validation error handler for express-validator
 */
const handleValidationResult = (req, res, next) => {
    const { validationResult } = require('express-validator');
    const result = validationResult(req);
    
    if (!result.isEmpty()) {
        const error = formatValidationErrors(result);
        return next(error);
    }
    
    next();
};

/**
 * Graceful shutdown handler for uncaught exceptions
 */
const handleUncaughtExceptions = () => {
    process.on('uncaughtException', (error) => {
        Log.e(
            'UncaughtException',
            'Uncaught Exception detected',
            error,
            { 
                pid: process.pid,
                memory: process.memoryUsage(),
                uptime: process.uptime()
            }
        );

        // In production, gracefully shut down
        if (config.isProduction) {
            Log.e('UncaughtException', 'Shutting down gracefully...');
            process.exit(1);
        }
    });

    process.on('unhandledRejection', (reason, promise) => {
        Log.e(
            'UnhandledRejection',
            'Unhandled Promise Rejection detected',
            reason,
            { 
                promise: promise.toString(),
                pid: process.pid,
                memory: process.memoryUsage(),
                uptime: process.uptime()
            }
        );

        // In production, gracefully shut down
        if (config.isProduction) {
            Log.e('UnhandledRejection', 'Shutting down gracefully...');
            process.exit(1);
        }
    });
};

module.exports = {
    // Error classes
    APIError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    RateLimitError,
    DatabaseError,
    ExternalServiceError,
    
    // Utilities
    isOperationalError,
    formatValidationErrors,
    normalizeError,
    
    // Middleware
    errorHandler,
    notFoundHandler,
    asyncHandler,
    handleValidationResult,
    handleUncaughtExceptions
};
