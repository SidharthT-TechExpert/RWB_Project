module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { paths: { '@quickbite/shared': ['../../packages/shared/src'] } } }],
  },
  moduleNameMapper: {
    '@quickbite/shared': '<rootDir>/../../packages/shared/src',
  },
  setupFilesAfterFramework: [],
  testTimeout: 30000,
  collectCoverageFrom: ['src/**/*.ts', '!src/tests/**', '!src/server.ts'],
};
