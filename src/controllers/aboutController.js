// About controller - handles about me information requests
// Similar to how you'd handle static data in Android (like displaying user profile info)

// Import models
const About = require('../models/About');
const Skill = require('../models/Skill');
const { Log } = require('../utils/simpleLogger');
const { NotFoundError, DatabaseError } = require('../middleware/errorHandler');

/**
 * Get about me information
 * Returns comprehensive about me data for the website
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAboutInfo = async (req, res) => {
    try {
        // Get active about profile from database
        const aboutData = await About.findOne({ isActive: true });
        
        if (!aboutData) {
            throw new NotFoundError('About information not found');
        }

        // Get all active skills grouped by category
        const skills = await Skill.find({ isActive: true })
            .sort({ category: 1, displayOrder: 1 });
        
        // Group skills by category
        const skillsByCategory = skills.reduce((acc, skill) => {
            if (!acc[skill.category]) {
                acc[skill.category] = [];
            }
            acc[skill.category].push({
                name: skill.name,
                proficiency: skill.proficiency,
                yearsOfExperience: skill.yearsOfExperience,
                description: skill.description
            });
            return acc;
        }, {});

        // Combine about data with skills data
        const combinedData = {
            name: aboutData.name,
            title: aboutData.title,
            email: aboutData.email,
            phone: aboutData.phone,
            location: aboutData.location,
            bio: aboutData.bio,
            experience: aboutData.experience,
            website: aboutData.website,
            github: aboutData.github,
            linkedin: aboutData.linkedin,
            resume: aboutData.resume,
            skills: skillsByCategory
        };

        // Log the request using new logging system
        const requestLogger = req.logger || Log;
        requestLogger.business(
            'AboutRequest',
            'About information requested',
            {
                ip: req.ip || 'unknown',
                userAgent: req.get('User-Agent') || 'unknown'
            }
        );

        // Return successful response
        res.json({
            success: true,
            data: combinedData,
            lastUpdated: aboutData.updatedAt,
            message: "About information retrieved successfully"
        });

    } catch (error) {
        throw new DatabaseError('Failed to fetch about information', error);
    }
};

module.exports = {
    getAboutInfo
};
