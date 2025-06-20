// Unit tests for About Controller
// Testing about information retrieval

// Mock models first
jest.mock('../../src/models/About');
jest.mock('../../src/models/Skill');

const { getAboutInfo } = require('../../src/controllers/aboutController');
const About = require('../../src/models/About');
const Skill = require('../../src/models/Skill');

describe('About Controller Unit Tests', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        mockRequest = {
            logger: {
                business: jest.fn(),
                e: jest.fn()
            },
            ip: '127.0.0.1',
            get: jest.fn().mockReturnValue('test-user-agent')
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.clearAllMocks();
    });

    describe('getAboutInfo', () => {
        it('should return about information successfully', async () => {
            // Arrange
            const mockAboutData = {
                name: 'Jeff Koretke',
                title: 'Software Developer',
                email: 'jeff@example.com',
                phone: '555-1234',
                location: 'San Francisco, CA',
                bio: 'Experienced developer with 10+ years',
                website: 'https://jeffkoretke.com',
                github: 'https://github.com/jeffkoretke',
                linkedin: 'https://linkedin.com/in/jeffkoretke',
                resume: 'resume.pdf',
                updatedAt: new Date('2024-01-01'),
                experience: [
                    {
                        company: 'Tech Company',
                        position: 'Senior Android Developer',
                        duration: '2020-2025',
                        description: 'Developed mobile applications'
                    }
                ]
            };

            const mockSkills = [
                {
                    category: 'Programming',
                    name: 'JavaScript',
                    proficiency: 9,
                    yearsOfExperience: 5,
                    description: 'Advanced JavaScript development'
                },
                {
                    category: 'Mobile',
                    name: 'Android',
                    proficiency: 8,
                    yearsOfExperience: 7,
                    description: 'Native Android development'
                }
            ];

            About.findOne = jest.fn().mockResolvedValue(mockAboutData);
            Skill.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockSkills)
            });

            // Act
            await getAboutInfo(mockRequest, mockResponse);

            // Assert
            expect(About.findOne).toHaveBeenCalledWith({ isActive: true });
            expect(Skill.find).toHaveBeenCalledWith({ isActive: true });
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    name: mockAboutData.name,
                    title: mockAboutData.title,
                    skills: expect.objectContaining({
                        Programming: expect.arrayContaining([
                            expect.objectContaining({
                                name: 'JavaScript',
                                proficiency: 9
                            })
                        ]),
                        Mobile: expect.arrayContaining([
                            expect.objectContaining({
                                name: 'Android',
                                proficiency: 8
                            })
                        ])
                    })
                }),
                lastUpdated: mockAboutData.updatedAt,
                message: "About information retrieved successfully"
            });
        });

        it('should handle case when no about data is found', async () => {
            // Arrange
            About.findOne = jest.fn().mockResolvedValue(null);

            // Act & Assert
            await expect(getAboutInfo(mockRequest, mockResponse))
                .rejects.toThrow('Failed to fetch about information');
        });

        it('should handle database errors', async () => {
            // Arrange
            About.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

            // Act & Assert
            await expect(getAboutInfo(mockRequest, mockResponse))
                .rejects.toThrow('Failed to fetch about information');
        });
    });
});
