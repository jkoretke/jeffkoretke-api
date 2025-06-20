// Unit tests for Utility Controller
// Testing simple utility endpoints

const { isItNotFriday } = require('../../src/controllers/utilityController');

describe('Utility Controller Unit Tests', () => {
    let mockRequest;
    let mockResponse;
    let OriginalDate;

    beforeEach(() => {
        mockRequest = {
            logger: {
                d: jest.fn(),
                e: jest.fn()
            }
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Store the original Date constructor
        OriginalDate = global.Date;
        jest.clearAllMocks();
    });

    afterEach(() => {
        // Restore the original Date constructor
        global.Date = OriginalDate;
    });

    describe('isItNotFriday', () => {
        it('should return "No" when it is Friday', () => {
            // Arrange - Mock Date to be a Friday (June 21, 2024 is a Friday)
            const mockFriday = new OriginalDate('2024-06-21T12:00:00.000Z');
            global.Date = jest.fn(() => mockFriday);
            global.Date.prototype = OriginalDate.prototype;

            // Act
            isItNotFriday(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                question: 'Is it not Friday?',
                answer: 'No',
                details: expect.objectContaining({
                    currentDay: 'Friday',
                    isFriday: true,
                    dayOfWeek: 5
                }),
                message: "It's Friday! Time to celebrate! 🎉"
            });
        });

        it('should return "Yes" when it is not Friday', () => {
            // Arrange - Mock Date to be a Monday (June 17, 2024 is a Monday)
            const mockMonday = new OriginalDate('2024-06-17T12:00:00.000Z');
            global.Date = jest.fn(() => mockMonday);
            global.Date.prototype = OriginalDate.prototype;

            // Act
            isItNotFriday(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                question: 'Is it not Friday?',
                answer: 'Yes',
                details: expect.objectContaining({
                    currentDay: 'Monday',
                    isFriday: false,
                    dayOfWeek: 1
                }),
                message: "It's Monday. Still waiting for Friday! ⏰"
            });
        });

        it('should handle errors gracefully', () => {
            // Arrange - Make Date constructor throw an error
            global.Date = jest.fn(() => {
                throw new Error('Date error');
            });

            // Mock environment
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            // Act
            isItNotFriday(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Internal server error while checking day',
                error: 'Date error'
            });

            // Restore environment
            process.env.NODE_ENV = originalEnv;
        });
    });
});
