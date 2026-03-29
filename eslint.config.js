import js from '@eslint/js'

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: '2022',
            sourceType: 'module',
        },
        globals: {
            console: 'readonly',
            process: 'readonly',
            Buffer: 'readonly',
            __dirname: 'readonly',
            __filename: 'readonly',
            URL: 'readonly',
            setTimeout: 'readonly',
            clearTimeout: 'readonly',
            setInterval: 'readonly',
            clearInterval: 'readonly',
        },
        rules: {
            indent: ['error', 2, { switchCase: 1 }],
            'linebreak-style': ['error', 'unix'],
            quotes: ['error', 'single'],
            semi: ['error', 'always'],
            'unused-vars': ['error', { args: 'none', ignoreRestSiblings: true }],
            'no-console': 'off',
            'prefer-const': 'error',
            'no-var': 'error',
            'object-shorthand': 'error',
            'prefer-arrow-callback': 'error',
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            globals:{
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                jest: 'readonly',
            },
        },
    },
    {
        ignores:['node_modules/**', 'coverage/**', 'logs/**', 'drizzle/**'],
    },
]