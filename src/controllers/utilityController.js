// Utility controller - handles simple utility endpoints
// Similar to Android utility classes that provide helper functions

/**
 * Check if today is NOT Friday
 * Returns "Yes" if it's not Friday, "No" if it is Friday
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const isItNotFriday = (req, res) => {
    try {
        // Get current date
        const now = new Date();
        
        // Get day of week (0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday)
        const dayOfWeek = now.getDay();
        
        // Friday is day 5
        const isFriday = dayOfWeek === 5;
        
        // Return "Yes" if NOT Friday, "No" if it IS Friday
        const answer = isFriday ? "No" : "Yes";
        
        // Get day name for additional info
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = dayNames[dayOfWeek];
        
        // Log the check (like Android's Log.d())
        console.log(`📅 Friday check: Today is ${currentDay}, is it NOT Friday? ${answer}`);
        
        // Send response
        res.json({
            success: true,
            question: "Is it not Friday?",
            answer: answer,
            details: {
                currentDay: currentDay,
                isFriday: isFriday,
                dayOfWeek: dayOfWeek,
                timestamp: now.toISOString(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            message: isFriday 
                ? "It's Friday! Time to celebrate! 🎉" 
                : `It's ${currentDay}. Still waiting for Friday! ⏰`
        });

    } catch (error) {
        console.error('❌ Error checking if it\'s not Friday:', error);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while checking day',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    isItNotFriday
};
