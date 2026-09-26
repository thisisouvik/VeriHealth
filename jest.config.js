const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  // Explicitly exclude node_modules from test discovery
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  // Per-file environment overrides for API/contract tests (no browser APIs needed)
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
}

module.exports = createJestConfig(customJestConfig)
