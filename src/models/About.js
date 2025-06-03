const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [50, 'Phone cannot exceed 50 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  bio: {
    type: String,
    required: [true, 'Bio is required'],
    maxlength: [2000, 'Bio cannot exceed 2000 characters']
  },
  experience: [{
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    position: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Position cannot exceed 100 characters']
    },
    duration: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Duration cannot exceed 50 characters']
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    achievements: [{
      type: String,
      maxlength: [200, 'Achievement cannot exceed 200 characters']
    }]
  }],
  website: {
    type: String,
    trim: true,
    maxlength: [255, 'Website URL cannot exceed 255 characters']
  },
  github: {
    type: String,
    trim: true,
    maxlength: [255, 'GitHub URL cannot exceed 255 characters']
  },
  linkedin: {
    type: String,
    trim: true,
    maxlength: [255, 'LinkedIn URL cannot exceed 255 characters']
  },
  resume: {
    type: String,
    trim: true,
    maxlength: [255, 'Resume URL cannot exceed 255 characters']
  },
  profileImage: {
    type: String,
    trim: true,
    maxlength: [255, 'Profile image URL cannot exceed 255 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Only allow one active profile at a time
aboutSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

module.exports = mongoose.model('About', aboutSchema);
