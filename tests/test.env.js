// Test environment setup
// Similar to setting up test environment in Android (like Application class for tests)

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001'; // Different port for testing
process.env.LOG_LEVEL = 'error'; // Reduce logging noise during tests

// Mock email service for testing (so we don't send real emails during tests)
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test-password';
process.env.EMAIL_TO = 'test-recipient@example.com';

// Use test database
process.env.MONGODB_URI = 'mongodb://localhost:27017/jeffkoretke_test';

// Disable HTTPS enforcement for testing
process.env.HTTPS_ONLY = 'false';

// Test session secret
process.env.SESSION_SECRET = 'test-secret-key';

// CORS settings for testing
process.env.CORS_ORIGIN = 'http://localhost:3001';

// API version
process.env.API_VERSION = '1.0.0-test';
