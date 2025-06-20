// Test database helper utilities
// Similar to database helpers in Android testing with Room

const mongoose = require('mongoose');
const Contact = require('../../src/models/Contact');
const About = require('../../src/models/About');
const Skill = require('../../src/models/Skill');

class TestDatabase {
    /**
     * Connect to test database
     */
    static async connect() {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }
    }

    /**
     * Disconnect from test database
     */
    static async disconnect() {
        await mongoose.connection.close();
    }

    /**
     * Clear all test data
     */
    static async clearAll() {
        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
            await collection.deleteMany({});
        }
    }

    /**
     * Seed test data for about information
     */
    static async seedAboutData() {
        const aboutData = new About({
            name: 'Test Jeff Koretke',
            title: 'Test Android Developer',
            email: 'test-jeff@example.com',
            bio: 'Test bio for Jeff Koretke',
            location: 'Test Location',
            experience: [
                {
                    company: 'Test Company',
                    position: 'Test Developer',
                    duration: '2020-2025',
                    description: 'Test experience description'
                }
            ],
            education: [
                {
                    institution: 'Test University',
                    degree: 'Test Computer Science',
                    year: '2020'
                }
            ],
            skills: ['Test Android', 'Test Kotlin', 'Test Java'],
            social: {
                github: 'https://github.com/test-jkoretke',
                linkedin: 'https://linkedin.com/in/test-jeffkoretke'
            }
        });

        return await aboutData.save();
    }

    /**
     * Seed test data for skills
     */
    static async seedSkillsData() {
        const skills = [
            new Skill({
                category: 'programming',
                name: 'Test Android Development',
                level: 'Expert',
                yearsOfExperience: 5,
                description: 'Test Android development experience'
            }),
            new Skill({
                category: 'programming',
                name: 'Test Kotlin',
                level: 'Expert',
                yearsOfExperience: 4,
                description: 'Test Kotlin programming experience'
            }),
            new Skill({
                category: 'tools',
                name: 'Test Android Studio',
                level: 'Expert',
                yearsOfExperience: 5,
                description: 'Test Android Studio usage'
            })
        ];

        return await Skill.insertMany(skills);
    }

    /**
     * Create test contact submission
     */
    static async createTestContact(overrides = {}) {
        const defaultContact = {
            name: 'Test Contact User',
            email: 'testcontact@example.com',
            message: 'Subject: Test Subject\\n\\nThis is a test contact message with sufficient length for validation.',
            ipAddress: '127.0.0.1',
            userAgent: 'Test User Agent',
            status: 'new'
        };

        const contactData = new Contact({ ...defaultContact, ...overrides });
        return await contactData.save();
    }

    /**
     * Get collection counts for verification
     */
    static async getCollectionCounts() {
        return {
            contacts: await Contact.countDocuments(),
            about: await About.countDocuments(),
            skills: await Skill.countDocuments()
        };
    }
}

module.exports = TestDatabase;
