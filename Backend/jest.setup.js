// Jest setup file
process.env.NODE_ENV = 'test';

// Suppress console.log during tests (optional)
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
};

// Setup global test timeout
jest.setTimeout(10000);