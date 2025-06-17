// Security middleware for HTTPS enforcement and additional security measures
// const config = require('../config/environment');

/**
 * Middleware to enforce HTTPS in production
 * Similar to Android's NetworkSecurityConfig for enforcing secure connections
 */
const enforceHTTPS = (req, res, next) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const httpsOnly = process.env.HTTPS_ONLY === 'true';
    
    if (isProduction && httpsOnly) {
        // Check if request is not secure
        if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
            // Redirect to HTTPS
            return res.redirect(301, `https://${req.get('host')}${req.url}`);
        }
    }
    next();
};

/**
 * Middleware to add additional security headers
 */
const additionalSecurityHeaders = (req, res, next) => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Remove sensitive headers that might leak information
    res.removeHeader('X-Powered-By');
    
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Feature Policy (Permissions Policy)
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    if (isProduction) {
        // Strict Transport Security (HSTS) - only in production with HTTPS
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    next();
};

/**
 * Middleware to sanitize request data
 */
const sanitizeRequest = (req, res, next) => {
    // Remove potentially dangerous characters from request
    if (req.body) {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                // Basic XSS prevention
                req.body[key] = req.body[key]
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/javascript:/gi, '')
                    .replace(/on\w+\s*=/gi, '');
            }
        }
    }
    next();
};

/**
 * Middleware to log security events
 */
const securityLogger = (req, res, next) => {
    // Log potentially suspicious activity
    const suspiciousPatterns = [
        /\.\.\//, // Path traversal
        /union.*select/i, // SQL injection
        /<script/i, // XSS attempts
        /javascript:/i, // JavaScript injection
        /vbscript:/i, // VBScript injection
        /onload/i, // Event handler injection
    ];
    
    const requestData = JSON.stringify({
        url: req.url,
        body: req.body,
        query: req.query,
        headers: req.headers
    });
    
    const suspicious = suspiciousPatterns.some(pattern => pattern.test(requestData));
    
    if (suspicious) {
        console.warn(`🚨 Suspicious request detected:`, {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.url,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    }
    
    next();
};

module.exports = {
    enforceHTTPS,
    additionalSecurityHeaders,
    sanitizeRequest,
    securityLogger
};
