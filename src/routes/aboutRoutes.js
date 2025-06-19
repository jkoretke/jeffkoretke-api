// About routes - defines the API endpoints for about me information
// Similar to defining URL patterns in Android (like navigation graph or deep links)

const express = require('express');
const router = express.Router();

// Import about controller
const { getAboutInfo } = require('../controllers/aboutController');
const { readOnlyLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/about - Get about me information with read-only rate limiting
// This endpoint will be called by your website to load about section
router.get('/', readOnlyLimiter, asyncHandler(getAboutInfo));

module.exports = router;
