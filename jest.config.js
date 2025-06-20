// Jest Configuration for Jeff Koretke API
// Similar to how you'd configure testing frameworks in Android (like JUnit configuration)

module.exports = {
    // Test environment - Node.js for server-side testing
    testEnvironment: 'node',
    
    // Test file patterns
    testMatch: [
        '**/tests/**/*.test.js',
        '**/tests/**/*.spec.js'
    ],
    
    // Coverage configuration (like code coverage in Android)
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/data/**',
        '!src/scripts/**',
        '!src/backups/**'
    ],
    
    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    
    // Timeout for tests (email tests might take longer)
    testTimeout: 30000,
    
    // Clear mocks between tests (similar to clearing state in Android tests)
    clearMocks: true,
    
    // Verbose output for detailed test results
    verbose: true,
    
    // Environment variables for testing
    setupFiles: ['<rootDir>/tests/test.env.js']
};
