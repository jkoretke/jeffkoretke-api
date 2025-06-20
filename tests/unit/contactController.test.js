// Unit tests for Contact Controller
// Similar to testing Android Activities/Fragments with JUnit and Mockito

const request = require('supertest');
const express = require('express');
const { submitContactForm, getContactSubmissions } = require('../../src/controllers/contactController');
const Contact = require('../../src/models/Contact');
const { sendContactNotification, sendConfirmationEmail } = require('../../src/utils/emailService');

// Mock dependencies
jest.mock('../../src/models/Contact');
jest.mock('../../src/utils/emailService');

describe('Contact Controller Unit Tests', () => {
    let app;
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        // Set up Express app for testing
        app = express();
        app.use(express.json());
        
        // Mock request and response objects (similar to mocking Context in Android)
        mockRequest = {
            body: {
                name: 'Test User',
                email: 'test@example.com',
                subject: 'Test Subject',
                message: 'Test message content'
            },
            ip: '127.0.0.1',
            get: jest.fn().mockReturnValue('test-user-agent'),
            logger: {
                business: jest.fn(),
                i: jest.fn(),
                w: jest.fn()
            }
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('submitContactForm', () => {
        it('should successfully submit a contact form', async () => {
            // Arrange - Set up test data (similar to Given in Android BDD tests)
            const savedContact = {
                _id: 'test-id-123',
                name: 'Test User',
                email: 'test@example.com',
                message: 'Subject: Test Subject\\n\\nTest message content',
                submittedAt: new Date()
            };

            Contact.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(savedContact)
            }));

            sendContactNotification.mockResolvedValue({ messageId: 'notification-sent' });
            sendConfirmationEmail.mockResolvedValue({ messageId: 'confirmation-sent' });

            // Act - Execute the function (similar to When in Android BDD tests)
            await submitContactForm(mockRequest, mockResponse);

            // Assert - Verify results (similar to Then in Android BDD tests)
            expect(Contact).toHaveBeenCalledWith({
                name: 'Test User',
                email: 'test@example.com',
                message: 'Subject: Test Subject\n\nTest message content',
                ipAddress: '127.0.0.1',
                userAgent: 'test-user-agent'
            });

            expect(sendContactNotification).toHaveBeenCalledWith({
                id: 'test-id-123',
                name: 'Test User',
                email: 'test@example.com',
                subject: 'Test Subject',
                message: 'Test message content',
                timestamp: savedContact.submittedAt.toISOString()
            });

            expect(sendConfirmationEmail).toHaveBeenCalledWith({
                name: 'Test User',
                email: 'test@example.com',
                subject: 'Test Subject',
                message: 'Test message content'
            });

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: 'Contact form submitted successfully',
                submissionId: 'test-id-123',
                timestamp: savedContact.submittedAt
            });
        });

        it('should handle database errors gracefully', async () => {
            // Arrange
            Contact.mockImplementation(() => ({
                save: jest.fn().mockRejectedValue(new Error('Database connection failed'))
            }));

            // Act & Assert
            await expect(submitContactForm(mockRequest, mockResponse))
                .rejects.toThrow('Failed to save contact submission');
        });

        it('should continue processing even if email notification fails', async () => {
            // Arrange
            const savedContact = {
                _id: 'test-id-123',
                name: 'Test User',
                email: 'test@example.com',
                message: 'Subject: Test Subject\\n\\nTest message content',
                submittedAt: new Date()
            };

            Contact.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(savedContact)
            }));

            sendContactNotification.mockRejectedValue(new Error('Email service unavailable'));
            sendConfirmationEmail.mockRejectedValue(new Error('Email service unavailable'));

            // Act
            await submitContactForm(mockRequest, mockResponse);

            // Assert - Form should still be submitted successfully
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: 'Contact form submitted successfully',
                submissionId: 'test-id-123',
                timestamp: savedContact.submittedAt
            });

            // Verify warning was logged
            expect(mockRequest.logger.w).toHaveBeenCalledWith(
                'EmailNotification',
                'Email notification failed',
                { error: 'Email service unavailable' }
            );
        });
    });

    describe('getContactSubmissions', () => {
        it('should return paginated contact submissions', async () => {
            // Arrange
            const mockSubmissions = [
                {
                    _id: 'sub1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    message: 'Test message 1',
                    submittedAt: new Date()
                },
                {
                    _id: 'sub2',
                    name: 'Jane Smith', 
                    email: 'jane@example.com',
                    message: 'Test message 2',
                    submittedAt: new Date()
                }
            ];

            mockRequest.query = { page: 1, limit: 10 };

            Contact.find = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        limit: jest.fn().mockReturnValue({
                            skip: jest.fn().mockResolvedValue(mockSubmissions)
                        })
                    })
                })
            });

            Contact.countDocuments = jest.fn().mockResolvedValue(2);

            // Act
            await getContactSubmissions(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                count: 2,
                total: 2,
                page: 1,
                pages: 1,
                submissions: mockSubmissions
            });
        });
    });
});
