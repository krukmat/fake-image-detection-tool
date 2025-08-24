// Jest setup file
process.env.NODE_ENV = 'test';
process.env.PORT = 3001; // Use different port for testing
process.env.PYTHON_API_URL = 'http://localhost:5000';

// Increase timeout for integration tests
jest.setTimeout(10000);