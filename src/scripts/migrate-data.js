const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
require('dotenv').config();

// Import models
const About = require('../models/About');
const Skill = require('../models/Skill');

// Import data
const aboutData = require('../data/about.json');
const skillsData = require('../data/skills.json');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask user for confirmation
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase());
    });
  });
};

// Backup existing data before migration
const backupData = async () => {
  try {
    console.log('💾 Creating backup of existing data...');
    
    const existingAbout = await About.find({});
    const existingSkills = await Skill.find({});
    
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
    
    const backupData = {
      timestamp: new Date().toISOString(),
      about: existingAbout,
      skills: existingSkills
    };
    
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`✅ Backup created: ${backupFile}`);
    return backupFile;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
};

const migrateData = async (options = {}) => {
  const { skipConfirmation = false, skipBackup = false } = options;
  
  try {
    console.log('🔄 Starting data migration...');
    
    // Validate environment
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set in environment variables');
    }
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check for existing data
    const existingAboutCount = await About.countDocuments();
    const existingSkillCount = await Skill.countDocuments();
    
    if (existingAboutCount > 0 || existingSkillCount > 0) {
      console.log(`⚠️  Found existing data:`);
      console.log(`   About profiles: ${existingAboutCount}`);
      console.log(`   Skills: ${existingSkillCount}`);
      
      if (!skipConfirmation) {
        const proceed = await askQuestion('⚠️  This will overwrite existing data. Continue? (yes/no): ');
        if (proceed !== 'yes' && proceed !== 'y') {
          console.log('❌ Migration cancelled by user');
          return;
        }
      }
      
      // Create backup unless skipped
      if (!skipBackup) {
        await backupData();
      }
    }
    
    // Validate source data exists
    if (!aboutData || !skillsData) {
      throw new Error('Source data files are missing or invalid');
    }
    
    console.log('🗑️ Clearing existing data...');
    const deleteResults = await Promise.all([
      About.deleteMany({}),
      Skill.deleteMany({})
    ]);
    
    console.log(`   Deleted ${deleteResults[0].deletedCount} about profiles`);
    console.log(`   Deleted ${deleteResults[1].deletedCount} skills`);
    
    // Migrate About data
    console.log('📝 Migrating about data...');
    const aboutDocument = new About({
      name: aboutData.name,
      title: aboutData.title,
      email: aboutData.email,
      phone: aboutData.phone,
      location: aboutData.location,
      bio: aboutData.bio,
      experience: aboutData.experience,
      website: aboutData.website,
      github: aboutData.github,
      linkedin: aboutData.linkedin,
      resume: aboutData.resume,
      profileImage: aboutData.profileImage,
      isActive: true
    });
    
    await aboutDocument.save();
    console.log('✅ About data migrated successfully');
    
    // Migrate Skills data
    console.log('🛠️ Migrating skills data...');
    let skillCounter = 0;
    
        for (const [category, skills] of Object.entries(skillsData)) {
      if (!Array.isArray(skills)) {
        console.warn(`⚠️  Skipping invalid skills category: ${category}`);
        continue;
      }
      
      for (let i = 0; i < skills.length; i++) {
        const skill = skills[i];
        
        try {
          const skillDocument = new Skill({
            category: category,
            name: skill.name || skill, // Handle both string and object formats
            proficiency: skill.proficiency || 'intermediate',
            yearsOfExperience: skill.yearsOfExperience || 0,
            description: skill.description || '',
            isActive: true,
            displayOrder: i
          });
          
          await skillDocument.save();
          skillCounter++;
        } catch (skillError) {
          console.warn(`⚠️  Failed to migrate skill: ${skill.name || skill}`, skillError.message);
        }
      }
    }
    
    console.log(`✅ ${skillCounter} skills migrated successfully`);
    
    // Verify migration
    const aboutCount = await About.countDocuments();
    const skillCount = await Skill.countDocuments();
    
    console.log('\n📊 Migration Summary:');
    console.log(`   About profiles: ${aboutCount}`);
    console.log(`   Skills: ${skillCount}`);
    
    // Verify data integrity
    if (aboutCount === 0) {
      console.warn('⚠️  Warning: No about profiles were created');
    }
    
    if (skillCount === 0) {
      console.warn('⚠️  Warning: No skills were created');
    }
    
    console.log('\n🎉 Data migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('💡 Check your MongoDB connection and data files');
    throw error;
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run migration if this script is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    skipConfirmation: args.includes('--force') || args.includes('-f'),
    skipBackup: args.includes('--no-backup')
  };
  
  migrateData(options)
    .then(() => {
      console.log('Migration process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration process failed:', error);
      process.exit(1);
    });
}

module.exports = migrateData;
