// eslint.config.js
import eslintPluginTs from '@typescript-eslint/eslint-plugin';
import parserTs from '@typescript-eslint/parser';

export default [
    {
        ignores: ['dist', 'node_modules', 'uploads'],
    },
    {
        languageOptions: {
            parser: parserTs,
            parserOptions: {
                project: './tsconfig.json',
                sourceType: 'module',
            },
            ecmaVersion: 2020,
        },
        plugins: {
            '@typescript-eslint': eslintPluginTs,
        },
        rules: {
            semi: ['error', 'always'],
            quotes: ['error', 'single'],
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['warn'],
            '@typescript-eslint/explicit-module-boundary-types': 'off',
        },
    },
];
