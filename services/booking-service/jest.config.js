module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: { '@quickbite/shared': '<rootDir>/../../packages/shared/src' },
  testTimeout: 30000,
};
