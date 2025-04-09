import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

// Filter out the problematic global key
const filteredBrowserGlobals = Object.entries(globals.browser)
  .filter(([key]) => key !== 'AudioWorkletGlobalScope ')
  .reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

export default tseslint.config(
  // General config for React/Browser code
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/server/**/*', 'dist/**', 'dist-server/**', 'node_modules/**'], // Ignore server files here
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'], // Use main tsconfig
        tsconfigRootDir: '.', 
      },
      globals: filteredBrowserGlobals, // Browser globals
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.strict.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  // Specific config for Server code
  {
    files: ['src/server/**/*.ts'],
    ignores: ['dist/**', 'dist-server/**', 'node_modules/**'], // Still ignore build/deps
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.server.json'], // Use server tsconfig
        tsconfigRootDir: '.', 
      },
      globals: { ...globals.node }, // Node globals
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.strict.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-prototype-builtins': 'error', // Keep this rule for server code too
    },
  }
);
