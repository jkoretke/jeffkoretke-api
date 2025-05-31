// Skills controller - handles technical skills information requests
// Similar to how you'd handle specialized data in Android (like fetching specific user preferences)

// Import skills data from JSON file
const skillsData = require('../data/skills.json');

/**
 * Get technical skills information
 * Returns categorized technical skills data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSkills = (req, res) => {
    try {
        // Log the request (like Android's Log.i())
        console.log(`🛠️ Skills info requested from ${req.ip || 'unknown IP'}`);

        // Return successful response with skills data
        res.json({
            success: true,
            data: skillsData,
            lastUpdated: new Date().toISOString(),
            message: "Skills information retrieved successfully"
        });

    } catch (error) {
        console.error('❌ Error fetching skills information:', error);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching skills information',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get skills by category
 * Returns skills for a specific category (languages, mobile, backend, tools, methodologies)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSkillsByCategory = (req, res) => {
    try {
        const { category } = req.params;
        
        // Check if category exists
        if (!skillsData[category]) {
            return res.status(404).json({
                success: false,
                message: `Skills category '${category}' not found`,
                availableCategories: Object.keys(skillsData)
            });
        }

        // Log the request
        console.log(`🛠️ Skills category '${category}' requested from ${req.ip || 'unknown IP'}`);

        // Return skills for the specific category
        res.json({
            success: true,
            category: category,
            skills: skillsData[category],
            count: skillsData[category].length,
            lastUpdated: new Date().toISOString(),
            message: `Skills for category '${category}' retrieved successfully`
        });

    } catch (error) {
        console.error('❌ Error fetching skills by category:', error);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching skills by category',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getSkills,
    getSkillsByCategory
};
