// Unit tests for Skills Controller
// Testing skills data retrieval

// Mock models first
jest.mock('../../src/models/Skill');

const { getSkills } = require('../../src/controllers/skillsController');
const Skill = require('../../src/models/Skill');

describe('Skills Controller Unit Tests', () => {
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

    describe('getSkills', () => {
        it('should return skills grouped by category successfully', async () => {
            // Arrange
            const mockSkills = [
                {
                    category: 'Programming',
                    name: 'JavaScript',
                    proficiency: 9,
                    yearsOfExperience: 5,
                    description: 'Advanced JavaScript development',
                    isActive: true,
                    updatedAt: new Date('2024-01-01')
                },
                {
                    category: 'Programming',
                    name: 'Python',
                    proficiency: 8,
                    yearsOfExperience: 3,
                    description: 'Backend development with Python',
                    isActive: true,
                    updatedAt: new Date('2024-01-02')
                },
                {
                    category: 'Mobile',
                    name: 'Android',
                    proficiency: 8,
                    yearsOfExperience: 7,
                    description: 'Native Android development',
                    isActive: true,
                    updatedAt: new Date('2024-01-03')
                }
            ];

            Skill.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockSkills)
            });

            // Act
            await getSkills(mockRequest, mockResponse);

            // Assert
            expect(Skill.find).toHaveBeenCalledWith({ isActive: true });
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    Programming: [
                        {
                            name: 'JavaScript',
                            proficiency: 9,
                            yearsOfExperience: 5,
                            description: 'Advanced JavaScript development'
                        },
                        {
                            name: 'Python',
                            proficiency: 8,
                            yearsOfExperience: 3,
                            description: 'Backend development with Python'
                        }
                    ],
                    Mobile: [
                        {
                            name: 'Android',
                            proficiency: 8,
                            yearsOfExperience: 7,
                            description: 'Native Android development'
                        }
                    ]
                },
                totalSkills: 3,
                categories: ['Programming', 'Mobile'],
                lastUpdated: expect.any(Number),
                message: "Skills information retrieved successfully"
            });
        });

        it('should handle case when no skills are found', async () => {
            // Arrange
            Skill.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue([])
            });

            // Act
            await getSkills(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: {},
                totalSkills: 0,
                categories: [],
                lastUpdated: expect.any(Date),
                message: "Skills information retrieved successfully"
            });
        });

        it('should handle database errors', async () => {
            // Arrange
            Skill.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockRejectedValue(new Error('Database error'))
            });

            // Act & Assert
            await expect(getSkills(mockRequest, mockResponse))
                .rejects.toThrow('Failed to fetch skills information');
        });
    });
});
