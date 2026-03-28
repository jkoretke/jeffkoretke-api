const express = require('express');
const router = express.Router();
const { getBlogs, getBlogBySlug } = require('../controllers/blogController');
const { readOnlyLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/', readOnlyLimiter, asyncHandler(getBlogs));
router.get('/:slug', readOnlyLimiter, asyncHandler(getBlogBySlug));

module.exports = router;
