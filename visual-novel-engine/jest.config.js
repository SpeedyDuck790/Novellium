export default {
  // Use jsdom environment for DOM testing
  testEnvironment: 'jsdom',

  // Coverage thresholds - aim for 95%
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },

  // Collect coverage from these files
  collectCoverageFrom: [
    'modules/**/*.js',
    '!modules/**/*.test.js',
    '!node_modules/**',
    '!coverage/**'
  ],

  // Where to find tests
  testMatch: [
    '**/tests/**/*.test.js'
  ],

  // Transform ES6 modules
  transform: {},

  // Module name mapping for cleaner imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },

  // Coverage reporting formats
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true
};
