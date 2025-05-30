// Utility routes - defines utility and fun API endpoints
// Similar to Android's utility methods that don't fit in main features

const express = require('express');
const router = express.Router();

// Import utility controller
const { isItNotFriday } = require('../controllers/utilityController');

// GET /api/isitnotfriday - Check if today is not Friday
router.get('/', isItNotFriday);

module.exports = router;
