// Contact form controller - handles contact form submissions
// Similar to how you'd handle form submissions in Android (like a Fragment handling user input)

const { validationResult } = require('express-validator');

// In-memory storage for contact submissions (for now)
// In production, you'd save this to a database or send via email
const contactSubmissions = [];

/**
 * Handle contact form submission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const submitContactForm = async (req, res) => {
    try {
        // Check for validation errors (like input validation in Android)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        // Extract validated data from request body
        const { name, email, subject, message } = req.body;

        // Create contact submission object
        const contactSubmission = {
            id: Date.now().toString(), // Simple ID generation
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
            timestamp: new Date().toISOString(),
            ip: req.ip || req.connection.remoteAddress, // Track IP for security
            userAgent: req.get('User-Agent') || 'Unknown'
        };

        // Store the submission (in memory for now)
        contactSubmissions.push(contactSubmission);

        // Log the submission (like Android's Log.i())
        console.log(`📩 New contact submission from ${contactSubmission.name} (${contactSubmission.email})`);
        console.log(`📝 Subject: ${contactSubmission.subject}`);

        // Send success response
        res.status(201).json({
            success: true,
            message: 'Contact form submitted successfully',
            submissionId: contactSubmission.id,
            timestamp: contactSubmission.timestamp
        });

        // TODO: In the future, you could:
        // 1. Send an email notification using nodemailer
        // 2. Save to a database
        // 3. Send a confirmation email to the user
        // 4. Integrate with a CRM system

    } catch (error) {
        console.error('❌ Error processing contact form:', error);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while processing contact form',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get all contact submissions (admin endpoint)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getContactSubmissions = (req, res) => {
    try {
        // In production, you'd add authentication/authorization here
        // For now, return all submissions (you might want to limit this later)
        
        res.json({
            success: true,
            count: contactSubmissions.length,
            submissions: contactSubmissions.map(submission => ({
                ...submission,
                // Don't expose sensitive info like IP in admin view
                ip: undefined,
                userAgent: undefined
            }))
        });
    } catch (error) {
        console.error('❌ Error fetching contact submissions:', error);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching submissions',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get a specific contact submission by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getContactSubmissionById = (req, res) => {
    try {
        const { id } = req.params;
        
        const submission = contactSubmissions.find(sub => sub.id === id);
        
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Contact submission not found'
            });
        }
        
        res.json({
            success: true,
            submission: {
                ...submission,
                ip: undefined, // Don't expose IP
                userAgent: undefined
            }
        });
    } catch (error) {
        console.error('❌ Error fetching contact submission:', error);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching submission',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    submitContactForm,
    getContactSubmissions,
    getContactSubmissionById
};
