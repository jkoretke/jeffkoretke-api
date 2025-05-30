// Contact form validation middleware using express-validator
// Similar to how you'd validate user input in Android before processing

const { body } = require('express-validator');

// Validation rules for contact form submission
const validateContactForm = [
    // Name validation
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s\-'\.]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, apostrophes, and periods')
        .trim()
        .escape(), // Sanitize to prevent XSS

    // Email validation
    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .isLength({ max: 100 })
        .withMessage('Email must be less than 100 characters')
        .normalizeEmail() // Convert to lowercase and trim
        .trim(),

    // Subject validation
    body('subject')
        .notEmpty()
        .withMessage('Subject is required')
        .isLength({ min: 5, max: 100 })
        .withMessage('Subject must be between 5 and 100 characters')
        .trim()
        .escape(),

    // Message validation
    body('message')
        .notEmpty()
        .withMessage('Message is required')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message must be between 10 and 1000 characters')
        .trim()
        .escape()
];

module.exports = {
    validateContactForm
};
