// About routes - defines the API endpoints for about me information
// Similar to defining URL patterns in Android (like navigation graph or deep links)

const express = require('express');
const router = express.Router();

// Import about controller
const { getAboutInfo } = require('../controllers/aboutController');

// GET /api/about - Get about me information
// This endpoint will be called by your website to load about section
router.get('/', getAboutInfo);

module.exports = router;
