// Rate limiting middleware using express-rate-limit
// Similar to how you'd throttle API calls in Android to prevent abuse

const rateLimit = require('express-rate-limit');

// General rate limiter for all API endpoints
// Allows 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests',
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Custom key generator (optional) - could be used for user-based limiting later
    keyGenerator: (req) => {
        return req.ip; // Default behavior, but explicit for clarity
    }
});

// Stricter rate limiter for contact form submissions
// Allows only 5 submissions per hour per IP to prevent spam
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 contact submissions per hour
    message: {
        success: false,
        error: 'Too many contact submissions',
        message: 'Too many contact form submissions from this IP. Please try again in an hour.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for successful requests to allow legitimate retries
    skipSuccessfulRequests: false,
    // Skip rate limiting for failed requests (validation errors don't count against limit)
    skipFailedRequests: true
});

// Very lenient limiter for GET requests (info, health checks, etc.)
// Allows 200 requests per 15 minutes per IP
const readOnlyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Higher limit for read-only operations
    message: {
        success: false,
        error: 'Too many requests',
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Strict limiter for sensitive operations (future use)
// Allows only 10 requests per hour per IP
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Very low limit for sensitive operations
    message: {
        success: false,
        error: 'Rate limit exceeded',
        message: 'Rate limit exceeded for sensitive operations. Please try again later.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    generalLimiter,
    contactLimiter,
    readOnlyLimiter,
    strictLimiter
};
