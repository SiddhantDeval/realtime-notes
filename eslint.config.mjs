// @ts-check

import eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig({
    files: ['**/*.js', '**/*.ts'],
    ignores: ['node_modules/**', 'dist/**'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
            project: './tsconfig.json',
        },
    },
    rules: {
        'no-console': 'warn', // Warns about console.log statements
        // Enforce consistent indentation (e.g., 4 spaces)
        indent: ['error', 4],
        // Enforce consistent use of single quotes for strings
        quotes: ['error', 'single'],
        // Enforce consistent use of semicolons
        semi: ['error', 'never'],
        // Require trailing commas in multiline object and array literals
        'comma-dangle': ['error', 'always-multiline'],
        // Enforce camelCase naming convention
        camelcase: ['error', { properties: 'always' }],
        // Disallow unused variables
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        // TypeScript-specific rules
        '@typescript-eslint/explicit-module-boundary-types': 'off', // Allow inferring return types
        '@typescript-eslint/no-explicit-any': 'warn', // Warn about using 'any'
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
})
