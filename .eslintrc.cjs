module.exports = {
  env: {
    node: true,
    es2021: true
  },
  // prettier last so eslint-config-prettier disables stylistic rules that conflict
  // (including space-before-function-paren — Prettier never inserts that space)
  extends: ['standard-with-typescript', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname
  },
  rules: {
    indent: 'off',
    '@typescript-eslint/indent': 'off',
    'space-before-function-paren': 'off',
    '@typescript-eslint/space-before-function-paren': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: {
          attributes: false,
          arguments: false
        }
      }
    ]
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.ts', '**/*.test.ts'],
      rules: {
        '@typescript-eslint/consistent-type-assertions': 'off'
      }
    },
    {
      files: ['src/services/whatsapp/baileys-loader.ts'],
      rules: {
        '@typescript-eslint/no-implied-eval': 'off',
        'no-new-func': 'off',
        '@typescript-eslint/consistent-type-imports': 'off'
      }
    }
  ]
}
