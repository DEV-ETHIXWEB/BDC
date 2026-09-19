// @ts-nocheck
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist/**', '.astro/**', 'node_modules/**', 'public/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs['flat/recommended'],
  ...astro.configs['flat/jsx-a11y-strict'],
  {
    files: ['src/**/*.{ts,tsx,js,astro}'],
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }], // `catch {}` is intentional around localStorage/sessionStorage
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      '@typescript-eslint/no-unused-expressions': ['error', { allowTernary: true, allowShortCircuit: true }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['src/**/*.tsx'],
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // Reading localStorage/sessionStorage/matchMedia after mount is the SSR-safe pattern for Astro islands.
      'react-hooks/set-state-in-effect': 'off',
      // Date.now() inside an event handler is not render-time impurity.
      'react-hooks/purity': 'off',
      // <div role="log" tabIndex={0}> is a deliberate keyboard-scrollable live region.
      'jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['tabpanel', 'log'], tags: [] }],
    },
  },
  {
    files: ['**/*.astro'],
    rules: { 'astro/jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['tabpanel', 'region', 'group'], tags: [] }] },
  },
  // Base.astro's is:inline boot script is deliberately ES5 (runs before any bundle, no transpile)
  { files: ['src/layouts/Base.astro', 'src/layouts/Base.astro/**'], rules: { 'no-var': 'off' } },
  // dev-only styleguide (not part of the production build)
  { files: ['src/pages/dev/**'], rules: { 'astro/jsx-a11y/anchor-is-valid': 'off' } },
);
