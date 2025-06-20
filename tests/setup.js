// Test setup file - runs before all tests
// Similar to @Before setup in Android JUnit tests

// Global test setup
global.console = {
    ...console,
    // Suppress console.log during tests unless explicitly needed
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
};

// Increase timeout for async operations (like database connections)
jest.setTimeout(30000);

// Global teardown
afterAll(async () => {
    // Clean up any global resources
    await new Promise(resolve => setTimeout(resolve, 1000));
});
