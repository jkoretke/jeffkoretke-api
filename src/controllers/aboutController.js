// About controller - handles about me information requests
// Similar to how you'd handle static data in Android (like displaying user profile info)

// Import models
const About = require('../models/About');
const Skill = require('../models/Skill');

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
            return res.status(404).json({
                success: false,
                message: 'About information not found'
            });
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

        // Log the request (like Android's Log.i())
        console.log(`📋 About info requested from ${req.ip || 'unknown IP'}`);

        // Return successful response
        res.json({
            success: true,
            data: combinedData,
            lastUpdated: aboutData.updatedAt,
            message: "About information retrieved successfully"
        });

    } catch (error) {
        console.error('❌ Error fetching about information:', error);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching about information',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getAboutInfo
};
