// About controller - handles about me information requests
// Similar to how you'd handle static data in Android (like displaying user profile info)

// Import data from JSON files
const aboutData = require('../data/about.json');
const skillsData = require('../data/skills.json');

/**
 * Get about me information
 * Returns comprehensive about me data for the website
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAboutInfo = (req, res) => {
    try {
        // Combine about data with skills data
        const combinedData = {
            ...aboutData,
            skills: skillsData
        };

        // Log the request (like Android's Log.i())
        console.log(`📋 About info requested from ${req.ip || 'unknown IP'}`);

        // Return successful response
        res.json({
            success: true,
            data: combinedData,
            lastUpdated: new Date().toISOString(),
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
