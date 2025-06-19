// Contact routes - defines the API endpoints for contact functionality
// Similar to how you'd define URL patterns in Android (like in a manifest or deep links)

const express = require('express');
const router = express.Router();

// Import controller and validation middleware
const {
    submitContactForm,
    getContactSubmissions,
    getContactSubmissionById
} = require('../controllers/contactController');

const { validateContactForm } = require('../middleware/validation');
const { contactLimiter, readOnlyLimiter } = require('../middleware/rateLimiter');
const { testEmailConfig } = require('../utils/emailService');
const { asyncHandler, handleValidationResult } = require('../middleware/errorHandler');

// POST /api/contact - Submit contact form with strict rate limiting
// This is the main endpoint your website will call
router.post('/', contactLimiter, validateContactForm, handleValidationResult, asyncHandler(submitContactForm));

// GET /api/contact - Get all contact submissions (admin endpoint) with read-only rate limiting
// Useful for viewing all submissions (you might want to add auth later)
router.get('/', readOnlyLimiter, asyncHandler(getContactSubmissions));

// GET /api/contact/test-email - Test email configuration (development only)
if (process.env.NODE_ENV === 'development') {
    router.get('/test-email', readOnlyLimiter, asyncHandler(async (req, res) => {
        const isValid = await testEmailConfig();
        res.json({
            success: true,
            emailConfigValid: isValid,
            message: isValid ? 'Email configuration is working' : 'Email configuration has issues'
        });
    }));
}

// GET /api/contact/:id - Get specific contact submission with read-only rate limiting
// Useful for viewing individual submissions
router.get('/:id', readOnlyLimiter, asyncHandler(getContactSubmissionById));

module.exports = router;
