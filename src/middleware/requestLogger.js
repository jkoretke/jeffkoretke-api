// Request/Response logging middleware
// Comprehensive HTTP request and response logging for monitoring and debugging

const { Log, createRequestLogger } = require('../utils/simpleLogger');
const config = require('../config/environment');

/**
 * Enhanced request logging middleware
 * Similar to Android's network request interceptors
 */
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    
    // Generate unique request ID for tracking (like Android's request correlation ID)
    req.requestId = req.requestId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create request-specific logger
    req.logger = createRequestLogger(
        req.requestId,
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent') || 'Unknown'
    );

    // Log incoming request
    req.logger.http(
        'IncomingRequest',
        `${req.method} ${req.originalUrl}`,
        {
            type: 'request',
            method: req.method,
            url: req.originalUrl,
            query: req.query,
            headers: config.isDevelopment ? req.headers : {
                'content-type': req.get('content-type'),
                'user-agent': req.get('user-agent'),
                'origin': req.get('origin'),
                'referer': req.get('referer')
            },
            body: shouldLogBody(req) ? req.body : '[REDACTED]',
            contentLength: req.get('content-length') || 0,
            timestamp: new Date().toISOString()
        }
    );

    // Capture response details
    const originalSend = res.send;
    const originalJson = res.json;
    let responseBody = null;

    // Override res.send to capture response body
    res.send = function(body) {
        responseBody = body;
        return originalSend.call(this, body);
    };

    // Override res.json to capture JSON response
    res.json = function(obj) {
        responseBody = obj;
        return originalJson.call(this, obj);
    };

    // Log response when request finishes
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const responseSize = res.get('content-length') || 
                            (responseBody ? JSON.stringify(responseBody).length : 0);

        // Log response details
        req.logger.http(
            'OutgoingResponse',
            `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`,
            {
                type: 'response',
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                statusMessage: res.statusMessage,
                duration: duration,
                responseSize: responseSize,
                headers: config.isDevelopment ? res.getHeaders() : {
                    'content-type': res.get('content-type'),
                    'content-length': res.get('content-length')
                },
                body: shouldLogResponseBody(req, res, responseBody) ? responseBody : '[REDACTED]',
                timestamp: new Date().toISOString()
            }
        );

        // Performance monitoring
        if (duration > 1000) { // Log slow requests (> 1 second)
            req.logger.performance(
                'SlowRequest',
                `Slow request detected: ${req.method} ${req.originalUrl}`,
                duration,
                {
                    statusCode: res.statusCode,
                    responseSize: responseSize
                }
            );
        }

        // Log error responses
        if (res.statusCode >= 400) {
            const logLevel = res.statusCode >= 500 ? 'error' : 'warn';
            const logMethod = res.statusCode >= 500 ? req.logger.e : req.logger.w;
            
            logMethod.call(req.logger,
                'ErrorResponse',
                `${req.method} ${req.originalUrl} - ${res.statusCode} ${res.statusMessage}`,
                res.statusCode >= 500 ? new Error(`HTTP ${res.statusCode}`) : null,
                {
                    statusCode: res.statusCode,
                    duration: duration,
                    responseSize: responseSize
                }
            );
        }

        // Business logic logging for successful operations
        if (res.statusCode >= 200 && res.statusCode < 300) {
            // Log successful business operations
            if (req.method === 'POST' && req.originalUrl.includes('/contact')) {
                req.logger.business(
                    'ContactSubmission',
                    'New contact form submission processed',
                    {
                        statusCode: res.statusCode,
                        duration: duration
                    }
                );
            }
            
            if (req.method === 'GET' && req.originalUrl.includes('/about')) {
                req.logger.business(
                    'AboutInfoRequested',
                    'About information requested',
                    {
                        statusCode: res.statusCode,
                        duration: duration
                    }
                );
            }
        }
    });

    // Handle request errors/aborts
    req.on('aborted', () => {
        const duration = Date.now() - startTime;
        req.logger.w(
            'RequestAborted',
            `Request aborted: ${req.method} ${req.originalUrl}`,
            {
                type: 'aborted',
                duration: duration,
                timestamp: new Date().toISOString()
            }
        );
    });

    req.on('error', (error) => {
        req.logger.e(
            'RequestError',
            `Request error: ${req.method} ${req.originalUrl}`,
            error,
            {
                type: 'request_error',
                timestamp: new Date().toISOString()
            }
        );
    });

    next();
};

/**
 * Determine if request body should be logged
 */
const shouldLogBody = (req) => {
    // Don't log body in production for security
    if (config.isProduction) {
        return false;
    }

    // Don't log sensitive endpoints
    const sensitiveEndpoints = ['/auth', '/login', '/password'];
    if (sensitiveEndpoints.some(endpoint => req.originalUrl.includes(endpoint))) {
        return false;
    }

    // Don't log large bodies
    const contentLength = parseInt(req.get('content-length') || '0');
    if (contentLength > 10000) { // 10KB limit
        return false;
    }

    // Don't log file uploads
    const contentType = req.get('content-type') || '';
    if (contentType.includes('multipart/form-data') || contentType.includes('application/octet-stream')) {
        return false;
    }

    return true;
};

/**
 * Determine if response body should be logged
 */
const shouldLogResponseBody = (req, res, body) => {
    // Don't log body in production for large responses
    if (config.isProduction && body && JSON.stringify(body).length > 1000) {
        return false;
    }

    // Always log error responses for debugging
    if (res.statusCode >= 400) {
        return true;
    }

    // Log successful responses in development
    if (config.isDevelopment) {
        return true;
    }

    return false;
};

/**
 * Database operation logging middleware
 */
const databaseLogger = (operation, collection, query = {}) => {
    const startTime = Date.now();
    
    return {
        success: (result) => {
            const duration = Date.now() - startTime;
            Log.database(
                'DatabaseOperation',
                `${operation} operation on ${collection} completed successfully`,
                {
                    operation,
                    collection,
                    query: config.isDevelopment ? query : '[REDACTED]',
                    resultCount: Array.isArray(result) ? result.length : (result ? 1 : 0),
                    duration: duration,
                    timestamp: new Date().toISOString()
                }
            );
            
            // Log slow database operations
            if (duration > 1000) {
                Log.performance(
                    'SlowDatabase',
                    `Slow database operation: ${operation} on ${collection}`,
                    duration,
                    {
                        operation,
                        collection,
                        query: config.isDevelopment ? query : '[REDACTED]'
                    }
                );
            }
        },
        
        error: (error) => {
            const duration = Date.now() - startTime;
            Log.e(
                'DatabaseOperation',
                `${operation} operation on ${collection} failed`,
                error,
                {
                    operation,
                    collection,
                    query: config.isDevelopment ? query : '[REDACTED]',
                    duration: duration,
                    timestamp: new Date().toISOString()
                }
            );
        }
    };
};

/**
 * Security event logging
 */
const securityLogger = (event, details = {}) => {
    Log.security(
        'SecurityEvent',
        event,
        {
            ...details,
            timestamp: new Date().toISOString(),
            severity: determineSeverity(event, details)
        }
    );
};

/**
 * Determine security event severity
 */
const determineSeverity = (event, details) => {
    // High severity events
    const highSeverityEvents = [
        'brute_force_attack',
        'sql_injection_attempt',
        'xss_attempt',
        'unauthorized_access_attempt'
    ];
    
    // Medium severity events
    const mediumSeverityEvents = [
        'rate_limit_exceeded',
        'suspicious_user_agent',
        'unusual_request_pattern'
    ];
    
    if (highSeverityEvents.some(e => event.toLowerCase().includes(e))) {
        return 'HIGH';
    }
    
    if (mediumSeverityEvents.some(e => event.toLowerCase().includes(e))) {
        return 'MEDIUM';
    }
    
    return 'LOW';
};

/**
 * API metrics logging
 */
const metricsLogger = () => {
    const metrics = {
        requests: 0,
        errors: 0,
        avgResponseTime: 0,
        responseTimes: []
    };
    
    return {
        recordRequest: (duration, statusCode) => {
            metrics.requests++;
            metrics.responseTimes.push(duration);
            
            if (statusCode >= 400) {
                metrics.errors++;
            }
            
            // Calculate average response time
            metrics.avgResponseTime = metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length;
            
            // Keep only last 100 response times for memory efficiency
            if (metrics.responseTimes.length > 100) {
                metrics.responseTimes = metrics.responseTimes.slice(-100);
            }
        },
        
        getMetrics: () => ({ ...metrics }),
        
        logPeriodic: () => {
            if (metrics.requests > 0) {
                Log.i(
                    'APIMetrics',
                    'Periodic API metrics report',
                    {
                        type: 'metrics',
                        totalRequests: metrics.requests,
                        totalErrors: metrics.errors,
                        errorRate: ((metrics.errors / metrics.requests) * 100).toFixed(2),
                        avgResponseTime: metrics.avgResponseTime.toFixed(2),
                        timestamp: new Date().toISOString()
                    }
                );
            }
        }
    };
};

module.exports = {
    requestLogger,
    databaseLogger,
    securityLogger,
    metricsLogger,
    shouldLogBody,
    shouldLogResponseBody
};
