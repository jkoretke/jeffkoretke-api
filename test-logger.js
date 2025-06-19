// Test file to isolate the hanging issue
console.log('Starting test...');

try {
    console.log('Loading environment config...');
    require('dotenv').config();
    
    console.log('Loading logger...');
    const { Log } = require('./src/utils/logger');
    
    console.log('Logger loaded successfully');
    Log.i('Test', 'Logger is working');
    
    console.log('Test completed successfully');
    process.exit(0);
} catch (error) {
    console.error('Error during test:', error);
    process.exit(1);
}
