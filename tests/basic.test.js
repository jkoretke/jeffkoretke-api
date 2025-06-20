// Simple test to verify Jest is working
describe('Basic Jest Test', () => {
    test('should run a basic test', () => {
        expect(1 + 1).toBe(2);
    });

    test('should handle async operations', async () => {
        const result = await Promise.resolve('hello');
        expect(result).toBe('hello');
    });
});
