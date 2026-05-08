/**
 * ESLint Configuration File
 * Description: Defines linting rules for the React/Vite project to ensure code quality
 * and consistency. Uses flat config format (ESLint 9+).
 * 
 * Purpose:
 * - Enforces React best practices
 - Catches common errors and unused variables
 * - Provides fast refresh compatibility
 * - Ignores dist folder from linting
 */

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Ignore the build output directory
  globalIgnores(['dist']),
  
  // Main configuration for JavaScript/JSX files
  {
    // Apply to all JavaScript and JSX files
    files: ['**/*.{js,jsx}'],
    
    // Extend recommended configs from ESLint, React Hooks, and React Refresh
    extends: [
      js.configs.recommended,           // ESLint recommended rules
      reactHooks.configs.flat.recommended,  // React Hooks rules (Rules of Hooks)
      reactRefresh.configs.vite,        // React Refresh rules for Vite HMR
    ],
    
    languageOptions: {
      ecmaVersion: 2020,                // Support modern ES2020 syntax
      globals: globals.browser,         // Browser global variables (window, document, etc.)
      parserOptions: {
        ecmaVersion: 'latest',          // Latest ECMAScript version
        ecmaFeatures: { jsx: true },    // Enable JSX parsing
        sourceType: 'module',           // Use ES modules (import/export)
      },
    },
    
    // Custom rule overrides
    rules: {
      // Allow unused variables that start with capital letter or underscore
      // Useful for React component props that follow naming patterns
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])