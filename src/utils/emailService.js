// Email service utility using nodemailer
// Similar to how you'd create a utility class in Android for sending data

const nodemailer = require('nodemailer');

/**
 * Create and configure email transporter
 * Similar to setting up a network client in Android
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

/**
 * Send contact form notification email
 * @param {Object} contactData - Contact form data
 * @returns {Promise} - Email send result
 */
const sendContactNotification = async (contactData) => {
    try {
        const transporter = createTransporter();
        
        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO,
            subject: `New Contact Form Submission: ${contactData.subject}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>From:</strong> ${contactData.name}</p>
                <p><strong>Email:</strong> ${contactData.email}</p>
                <p><strong>Subject:</strong> ${contactData.subject}</p>
                <p><strong>Message:</strong></p>
                <p>${contactData.message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><small>Submitted on: ${contactData.timestamp}</small></p>
                <p><small>IP Address: ${contactData.ip}</small></p>
            `,
            text: `
New Contact Form Submission

From: ${contactData.name}
Email: ${contactData.email}
Subject: ${contactData.subject}

Message:
${contactData.message}

Submitted on: ${contactData.timestamp}
IP Address: ${contactData.ip}
            `
        };

        // Send email
        const result = await transporter.sendMail(mailOptions);
        console.log('📧 Contact notification email sent:', result.messageId);
        return result;
        
    } catch (error) {
        console.error('❌ Error sending contact notification email:', error);
        throw error;
    }
};

/**
 * Send confirmation email to the person who submitted the form
 * @param {Object} contactData - Contact form data
 * @returns {Promise} - Email send result
 */
const sendConfirmationEmail = async (contactData) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: contactData.email,
            subject: 'Thank you for contacting Jeff Koretke',
            html: `
                <h2>Thank you for your message!</h2>
                <p>Hi ${contactData.name},</p>
                <p>Thank you for reaching out through my website. I've received your message about "${contactData.subject}" and will get back to you as soon as possible.</p>
                
                <h3>Your message:</h3>
                <p>${contactData.message.replace(/\n/g, '<br>')}</p>
                
                <p>Best regards,<br>
                Jeff Koretke<br>
                Android Developer</p>
                
                <hr>
                <p><small>This is an automated confirmation email. Please don't reply to this email.</small></p>
            `,
            text: `
Thank you for your message!

Hi ${contactData.name},

Thank you for reaching out through my website. I've received your message about "${contactData.subject}" and will get back to you as soon as possible.

Your message:
${contactData.message}

Best regards,
Jeff Koretke
Android Developer

---
This is an automated confirmation email. Please don't reply to this email.
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('📧 Confirmation email sent to:', contactData.email);
        return result;
        
    } catch (error) {
        console.error('❌ Error sending confirmation email:', error);
        throw error;
    }
};

/**
 * Test email configuration
 * @returns {Promise<boolean>} - Test result
 */
const testEmailConfig = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Email configuration is valid');
        return true;
    } catch (error) {
        console.error('❌ Email configuration test failed:', error);
        return false;
    }
};

module.exports = {
    sendContactNotification,
    sendConfirmationEmail,
    testEmailConfig
};
