module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of these
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation only
        'style',    // Formatting, missing semi-colons, etc (no logic change)
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf',     // Performance improvement
        'test',     // Adding or updating tests
        'chore',    // Build process, dependencies, tooling
        'ci',       // CI/CD changes
        'revert',   // Revert a previous commit
        'build',    // Build system changes
        'hotfix',   // Critical fix for production
      ],
    ],
    // Scope is optional but encouraged
    'scope-enum': [
      1,
      'always',
      [
        // Services
        'api-gateway',
        'auth',
        'user',
        'restaurant',
        'food',
        'booking',
        'order',
        'payment',
        'review',
        'search',
        'location',
        'notification',
        'admin',
        'analytics',
        // Apps
        'web',
        'mobile',
        // Infrastructure
        'shared',
        'docker',
        'k8s',
        'ci',
        'deps',
        'config',
      ],
    ],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [1, 'always', 100],
    'footer-max-line-length': [1, 'always', 100],
    'header-max-length': [2, 'always', 100],
  },
};
