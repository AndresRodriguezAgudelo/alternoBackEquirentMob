/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  roots: ['src'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'src', __dirname],

  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
  },
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  resetModules: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["html", "text"],
};
