// Sentry error tracking integration (optional)
// External error monitoring service for production environments

const { Log } = require('./logger');
const config = require('../config/environment');

let Sentry = null;
let sentryInitialized = false;

// Initialize Sentry if DSN is provided
const initializeSentry = () => {
    if (sentryInitialized) return;

    try {
        // Only initialize if SENTRY_DSN is provided
        if (process.env.SENTRY_DSN) {
            // Dynamically import Sentry only if needed
            Sentry = require('@sentry/node');
            
            Sentry.init({
                dsn: process.env.SENTRY_DSN,
                environment: config.NODE_ENV,
                integrations: [
                    // Add profiling integration for performance monitoring
                    new Sentry.Integrations.Http({ tracing: true }),
                ],
                // Set sample rate for performance monitoring
                tracesSampleRate: config.isProduction ? 0.1 : 1.0,
                // Set sample rate for error events
                sampleRate: 1.0,
                // Release information
                release: process.env.SENTRY_RELEASE || `jeffkoretke-api@${config.API_VERSION}`,
                // Additional context
                beforeSend(event, hint) {
                    // Filter out operational errors that don't need tracking
                    const error = hint.originalException;
                    if (error && error.isOperational) {
                        // Only send non-operational errors to Sentry
                        if (error.statusCode < 500) {
                            return null; // Don't send client errors (4xx)
                        }
                    }
                    return event;
                },
                // Add user context
                beforeBreadcrumb(breadcrumb) {
                    // Filter sensitive data from breadcrumbs
                    if (breadcrumb.category === 'http' && breadcrumb.data) {
                        delete breadcrumb.data.authorization;
                        delete breadcrumb.data.cookie;
                    }
                    return breadcrumb;
                }
            });

            sentryInitialized = true;
            Log.i('Sentry', 'Sentry error tracking initialized');
        } else {
            Log.d('Sentry', 'Sentry DSN not provided, skipping initialization');
        }
    } catch (error) {
        Log.e('Sentry', 'Failed to initialize Sentry', error);
    }
};

// Capture error with context
const captureError = (error, context = {}) => {
    if (!Sentry || !sentryInitialized) return;

    try {
        Sentry.withScope((scope) => {
            // Add context information
            if (context.requestId) {
                scope.setTag('requestId', context.requestId);
            }
            
            if (context.userId) {
                scope.setUser({ id: context.userId });
            }
            
            if (context.ip) {
                scope.setContext('request', {
                    ip: context.ip,
                    userAgent: context.userAgent,
                    url: context.url,
                    method: context.method
                });
            }
            
            // Set additional tags
            scope.setTag('component', context.component || 'api');
            scope.setLevel(error.statusCode >= 500 ? 'error' : 'warning');
            
            // Add fingerprint for grouping similar errors
            if (error.code) {
                scope.setFingerprint([error.code, error.message]);
            }
            
            Sentry.captureException(error);
        });
    } catch (sentryError) {
        Log.e('Sentry', 'Failed to capture error in Sentry', sentryError);
    }
};

// Capture message with context
const captureMessage = (message, level = 'info', context = {}) => {
    if (!Sentry || !sentryInitialized) return;

    try {
        Sentry.withScope((scope) => {
            // Add context
            if (context.requestId) {
                scope.setTag('requestId', context.requestId);
            }
            
            scope.setLevel(level);
            scope.setContext('additional', context);
            
            Sentry.captureMessage(message);
        });
    } catch (error) {
        Log.e('Sentry', 'Failed to capture message in Sentry', error);
    }
};

// Express error handler middleware for Sentry
const sentryErrorHandler = () => {
    if (Sentry && sentryInitialized) {
        return Sentry.Handlers.errorHandler({
            shouldHandleError(error) {
                // Only handle server errors (5xx) and operational errors
                return error.status >= 500 || error.isOperational === false;
            }
        });
    }
    
    // Return no-op middleware if Sentry not initialized
    return (error, req, res, next) => next(error);
};

// Express request handler middleware for Sentry
const sentryRequestHandler = () => {
    if (Sentry && sentryInitialized) {
        return Sentry.Handlers.requestHandler({
            user: ['id', 'email'],
            request: ['method', 'url', 'headers', 'query'],
            serverName: false // Don't include server name for privacy
        });
    }
    
    // Return no-op middleware if Sentry not initialized
    return (req, res, next) => next();
};

// Performance monitoring for API endpoints
const startTransaction = (name, operation = 'http.server') => {
    if (!Sentry || !sentryInitialized) return null;
    
    try {
        return Sentry.startTransaction({
            name,
            op: operation,
            tags: {
                component: 'api'
            }
        });
    } catch (error) {
        Log.e('Sentry', 'Failed to start transaction', error);
        return null;
    }
};

// Add breadcrumb for debugging
const addBreadcrumb = (message, category = 'custom', level = 'info', data = {}) => {
    if (!Sentry || !sentryInitialized) return;
    
    try {
        Sentry.addBreadcrumb({
            message,
            category,
            level,
            data,
            timestamp: Date.now() / 1000
        });
    } catch (error) {
        Log.e('Sentry', 'Failed to add breadcrumb', error);
    }
};

// Health check for Sentry
const healthCheck = () => {
    return {
        enabled: sentryInitialized,
        dsn: process.env.SENTRY_DSN ? 'configured' : 'not configured',
        environment: config.NODE_ENV,
        release: process.env.SENTRY_RELEASE || `jeffkoretke-api@${config.API_VERSION}`
    };
};

module.exports = {
    initializeSentry,
    captureError,
    captureMessage,
    sentryErrorHandler,
    sentryRequestHandler,
    startTransaction,
    addBreadcrumb,
    healthCheck,
    get isInitialized() {
        return sentryInitialized;
    }
};
