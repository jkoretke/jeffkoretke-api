const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['languages', 'mobile', 'backend', 'tools', 'methodologies', 'frameworks', 'platforms', 'databases'],
      message: 'Category must be one of: languages, mobile, backend, tools, methodologies, frameworks, platforms, databases'
    }
  },
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    maxlength: [100, 'Skill name cannot exceed 100 characters']
  },
  proficiency: {
    type: String,
    enum: {
      values: ['beginner', 'intermediate', 'advanced', 'expert'],
      message: 'Proficiency must be one of: beginner, intermediate, advanced, expert'
    },
    default: 'intermediate'
  },
  yearsOfExperience: {
    type: Number,
    min: [0, 'Years of experience cannot be negative'],
    max: [50, 'Years of experience cannot exceed 50'],
    default: 0
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
skillSchema.index({ category: 1, displayOrder: 1 });
skillSchema.index({ isActive: 1, category: 1 });

// Ensure unique skill names within the same category
skillSchema.index({ category: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Skill', skillSchema);
