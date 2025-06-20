// Unit tests for Email Service
// Testing email functionality without actually sending emails

const nodemailer = require('nodemailer');

// Mock nodemailer
jest.mock('nodemailer');

// Import after mocking
const { sendContactNotification, sendConfirmationEmail, testEmailConfig } = require('../../src/utils/emailService');

describe('Email Service Unit Tests', () => {
    let mockTransporter;

    beforeEach(() => {
        // Create mock transporter
        mockTransporter = {
            sendMail: jest.fn(),
            verify: jest.fn()
        };

        // Mock nodemailer.createTransport
        nodemailer.createTransport.mockReturnValue(mockTransporter);

        jest.clearAllMocks();
    });

    describe('sendContactNotification', () => {
        it('should send notification email successfully', async () => {
            // Arrange
            const contactData = {
                id: 'test-id-123',
                name: 'Test User',
                email: 'test@example.com',
                subject: 'Test Subject',
                message: 'Test message content',
                timestamp: new Date().toISOString()
            };

            const mockResult = { messageId: 'notification-email-id' };
            mockTransporter.sendMail.mockResolvedValue(mockResult);

            // Act
            const result = await sendContactNotification(contactData);

            // Assert
            expect(nodemailer.createTransport).toHaveBeenCalledWith({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            expect(mockTransporter.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    from: process.env.EMAIL_USER,
                    to: process.env.EMAIL_TO,
                    subject: `New Contact Form Submission: ${contactData.subject}`,
                    html: expect.stringContaining(contactData.name),
                    text: expect.stringContaining(contactData.message)
                })
            );

            expect(result).toEqual(mockResult);
        });

        it('should handle email sending errors', async () => {
            // Arrange
            const contactData = {
                id: 'test-id-123',
                name: 'Test User',
                email: 'test@example.com',
                subject: 'Test Subject',
                message: 'Test message content',
                timestamp: new Date().toISOString()
            };

            const mockError = new Error('SMTP connection failed');
            mockTransporter.sendMail.mockRejectedValue(mockError);

            // Act & Assert
            await expect(sendContactNotification(contactData))
                .rejects.toThrow('SMTP connection failed');
        });
    });

    describe('sendConfirmationEmail', () => {
        it('should send confirmation email successfully', async () => {
            // Arrange
            const contactData = {
                name: 'Test User',
                email: 'test@example.com',
                subject: 'Test Subject',
                message: 'Test message content'
            };

            const mockResult = { messageId: 'confirmation-email-id' };
            mockTransporter.sendMail.mockResolvedValue(mockResult);

            // Act
            const result = await sendConfirmationEmail(contactData);

            // Assert
            expect(mockTransporter.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    from: process.env.EMAIL_USER,
                    to: contactData.email,
                    subject: 'Thank you for contacting Jeff Koretke',
                    html: expect.stringContaining(contactData.name),
                    text: expect.stringContaining('Thank you for your message!')
                })
            );

            expect(result).toEqual(mockResult);
        });

        it('should handle confirmation email errors', async () => {
            // Arrange
            const contactData = {
                name: 'Test User',
                email: 'test@example.com',
                subject: 'Test Subject',
                message: 'Test message content'
            };

            const mockError = new Error('Invalid recipient email');
            mockTransporter.sendMail.mockRejectedValue(mockError);

            // Act & Assert
            await expect(sendConfirmationEmail(contactData))
                .rejects.toThrow('Invalid recipient email');
        });
    });

    describe('testEmailConfig', () => {
        it('should return true for valid email configuration', async () => {
            // Arrange
            mockTransporter.verify.mockResolvedValue(true);

            // Act
            const result = await testEmailConfig();

            // Assert
            expect(mockTransporter.verify).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('should return false for invalid email configuration', async () => {
            // Arrange
            mockTransporter.verify.mockRejectedValue(new Error('Invalid credentials'));

            // Act
            const result = await testEmailConfig();

            // Assert
            expect(mockTransporter.verify).toHaveBeenCalled();
            expect(result).toBe(false);
        });
    });
});
