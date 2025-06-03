// Skills controller - handles technical skills information requests
// Similar to how you'd handle specialized data in Android (like fetching specific user preferences)

// Import skills model
const Skill = require('../models/Skill');

/**
 * Get technical skills information
 * Returns categorized technical skills data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSkills = async (req, res) => {
    try {
        // Get all active skills from database
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

        // Log the request (like Android's Log.i())
        console.log(`🛠️ Skills info requested from ${req.ip || 'unknown IP'}`);

        // Return successful response with skills data
        res.json({
            success: true,
            data: skillsByCategory,
            totalSkills: skills.length,
            categories: Object.keys(skillsByCategory),
            lastUpdated: skills.length > 0 ? Math.max(...skills.map(s => new Date(s.updatedAt))) : new Date(),
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
 * Returns skills for a specific category (languages, frameworks, tools, platforms, databases)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSkillsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        
        // Get skills for specific category
        const skills = await Skill.find({ 
            category: category, 
            isActive: true 
        }).sort({ displayOrder: 1 });
        
        // Check if category has any skills
        if (skills.length === 0) {
            // Get available categories
            const availableCategories = await Skill.distinct('category', { isActive: true });
            
            return res.status(404).json({
                success: false,
                message: `No skills found for category '${category}'`,
                availableCategories
            });
        }

        // Log the request
        console.log(`🛠️ Skills category '${category}' requested from ${req.ip || 'unknown IP'}`);

        // Format skills data
        const formattedSkills = skills.map(skill => ({
            name: skill.name,
            proficiency: skill.proficiency,
            yearsOfExperience: skill.yearsOfExperience,
            description: skill.description
        }));

        // Return skills for the specific category
        res.json({
            success: true,
            category: category,
            skills: formattedSkills,
            count: skills.length,
            lastUpdated: skills.length > 0 ? Math.max(...skills.map(s => new Date(s.updatedAt))) : new Date(),
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
