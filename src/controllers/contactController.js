// Contact form controller - handles contact form submissions
// Similar to how you'd handle form submissions in Android (like a Fragment handling user input)

const { validationResult } = require('express-validator');
const { sendContactNotification, sendConfirmationEmail } = require('../utils/emailService');
const Contact = require('../models/Contact');
const { Log } = require('../utils/simpleLogger');
const { ValidationError, DatabaseError } = require('../middleware/errorHandler');

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

        // Create contact submission in database
        const contactSubmission = new Contact({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            message: `Subject: ${subject.trim()}\n\n${message.trim()}`,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent') || 'Unknown'
        });

        // Save to database
        const savedSubmission = await contactSubmission.save();

        // Log the submission using new logging system
        const requestLogger = req.logger || Log;
        requestLogger.business(
            'ContactSubmission',
            `New contact submission from ${savedSubmission.name} (${savedSubmission.email})`,
            {
                submissionId: savedSubmission._id,
                name: savedSubmission.name,
                email: savedSubmission.email,
                subject: subject.trim()
            }
        );

        // Send email notifications
        try {
            // Send notification to you
            await sendContactNotification({
                id: savedSubmission._id,
                name: savedSubmission.name,
                email: savedSubmission.email,
                subject: subject.trim(),
                message: message.trim(),
                timestamp: savedSubmission.submittedAt.toISOString()
            });
            
            // Send confirmation to the submitter
            await sendConfirmationEmail({
                name: savedSubmission.name,
                email: savedSubmission.email,
                subject: subject.trim(),
                message: message.trim()
            });
            
            requestLogger.i('EmailNotification', 'Email notifications sent successfully');
        } catch (emailError) {
            // Log email error but don't fail the request
            requestLogger.w('EmailNotification', 'Email notification failed', { error: emailError.message });
            // Continue processing - the form submission is still valid
        }

        // Send success response
        res.status(201).json({
            success: true,
            message: 'Contact form submitted successfully',
            submissionId: savedSubmission._id,
            timestamp: savedSubmission.submittedAt
        });

    } catch (error) {
        // Database errors
        if (error.name === 'ValidationError') {
            throw new ValidationError('Contact form validation failed', Object.values(error.errors).map(err => ({
                type: 'field',
                message: err.message,
                field: err.path,
                value: err.value,
                location: 'body'
            })));
        }

        // General database error
        throw new DatabaseError('Failed to save contact submission', error);
    }
};

/**
 * Get all contact submissions (admin endpoint)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getContactSubmissions = async (req, res) => {
    try {
        // In production, you'd add authentication/authorization here
        const { page = 1, limit = 10, status } = req.query;
        
        // Build query
        const query = {};
        if (status) {
            query.status = status;
        }
        
        // Get submissions with pagination
        const submissions = await Contact.find(query)
            .select('-ipAddress -userAgent') // Don't expose sensitive info
            .sort({ submittedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await Contact.countDocuments(query);
        
        res.json({
            success: true,
            count: submissions.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            submissions
        });
    } catch (error) {
        throw new DatabaseError('Failed to fetch contact submissions', error);
    }
};

/**
 * Get a specific contact submission by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getContactSubmissionById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const submission = await Contact.findById(id)
            .select('-ipAddress -userAgent'); // Don't expose sensitive info
        
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Contact submission not found'
            });
        }
        
        res.json({
            success: true,
            submission
        });
    } catch (error) {
        throw new DatabaseError('Failed to fetch contact submission', error);
    }
};

module.exports = {
    submitContactForm,
    getContactSubmissions,
    getContactSubmissionById
};
