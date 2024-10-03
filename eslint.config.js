const nx = require('@nx/eslint-plugin');

module.exports = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['node_modules/', 'dist/'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-unsafe-function-type": "off",
      '@typescript-eslint/no-explicit-any': 'off',
      'unicorn/no-null': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'sonarjs/cognitive-complexity': 'off',
      'complexity': 'off',
      'unicorn/no-unreadable-array-destructuring': 'off',
      'unicorn/no-await-expression-member': 'off',
      'no-console': 'off',
      'unicorn/no-process-exit': 'off',
      'sonarjs/no-identical-expressions': 'off',
      'sonarjs/no-identical-functions': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
];
