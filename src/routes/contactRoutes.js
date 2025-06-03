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

// POST /api/contact - Submit contact form with strict rate limiting
// This is the main endpoint your website will call
router.post('/', contactLimiter, validateContactForm, submitContactForm);

// GET /api/contact - Get all contact submissions (admin endpoint) with read-only rate limiting
// Useful for viewing all submissions (you might want to add auth later)
router.get('/', readOnlyLimiter, getContactSubmissions);

// GET /api/contact/test-email - Test email configuration (development only)
if (process.env.NODE_ENV === 'development') {
    router.get('/test-email', readOnlyLimiter, async (req, res) => {
        try {
            const isValid = await testEmailConfig();
            res.json({
                success: true,
                emailConfigValid: isValid,
                message: isValid ? 'Email configuration is working' : 'Email configuration has issues'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error testing email configuration',
                error: error.message
            });
        }
    });
}

// GET /api/contact/:id - Get specific contact submission with read-only rate limiting
// Useful for viewing individual submissions
router.get('/:id', readOnlyLimiter, getContactSubmissionById);

module.exports = router;
