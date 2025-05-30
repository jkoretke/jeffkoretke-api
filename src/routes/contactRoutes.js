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

// POST /api/contact - Submit contact form
// This is the main endpoint your website will call
router.post('/', validateContactForm, submitContactForm);

// GET /api/contact - Get all contact submissions (admin endpoint)
// Useful for viewing all submissions (you might want to add auth later)
router.get('/', getContactSubmissions);

// GET /api/contact/:id - Get specific contact submission
// Useful for viewing individual submissions
router.get('/:id', getContactSubmissionById);

module.exports = router;
