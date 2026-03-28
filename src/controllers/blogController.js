const BlogPost = require('../models/BlogPost');
const { Log } = require('../utils/simpleLogger');
const { DatabaseError, NotFoundError } = require('../middleware/errorHandler');

const getBlogs = async (req, res) => {
    try {
        const posts = await BlogPost.find({ isActive: true })
            .select('-content')
            .sort({ publishedAt: -1 });

        console.log(`📝 Blog list requested from ${req.ip || 'unknown IP'}`);

        res.json({
            success: true,
            data: posts,
            count: posts.length
        });
    } catch (error) {
        throw new DatabaseError('Failed to fetch blog posts', error);
    }
};

const getBlogBySlug = async (req, res) => {
    try {
        const post = await BlogPost.findOne({ slug: req.params.slug, isActive: true });

        if (!post) {
            return res.status(404).json({ success: false, message: 'Blog post not found' });
        }

        console.log(`📝 Blog post "${post.title}" requested from ${req.ip || 'unknown IP'}`);

        res.json({ success: true, data: post });
    } catch (error) {
        throw new DatabaseError('Failed to fetch blog post', error);
    }
};

module.exports = { getBlogs, getBlogBySlug };
