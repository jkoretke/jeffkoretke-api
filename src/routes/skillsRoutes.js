// Skills routes - define API endpoints for technical skills
// Similar to how you'd define navigation paths in Android (like fragment navigation)

const express = require('express');
const router = express.Router();

// Import rate limiters
const { readOnlyLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');

// Import controller functions
const { getSkills, getSkillsByCategory } = require('../controllers/skillsController');

// Skills routes
// GET /api/skills - Get all technical skills
router.get('/', readOnlyLimiter, asyncHandler(getSkills));

// GET /api/skills/:category - Get skills by category (languages, mobile, backend, tools, methodologies)
router.get('/:category', readOnlyLimiter, asyncHandler(getSkillsByCategory));

module.exports = router;
