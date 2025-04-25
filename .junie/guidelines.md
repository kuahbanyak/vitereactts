# Project Development Guidelines

This document provides guidelines and information for developing and maintaining this React + TypeScript project.

## Build/Configuration Instructions

### Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (preferred package manager)

### Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Build for production:
   ```bash
   pnpm build
   ```

4. Preview the production build:
   ```bash
   pnpm preview
   ```

### Project Structure

- `src/` - Source code
  - `components/` - React components
    - `ui/` - UI components (buttons, inputs, etc.)
  - `lib/` - Utility functions and shared code
  - `assets/` - Static assets

### Configuration Files

- `vite.config.ts` - Vite configuration
  - Configured with React plugin and Tailwind CSS plugin
  - Path alias `@` points to `src/` directory
- `tsconfig.json` - TypeScript configuration
  - References app and node configurations
  - Path alias `@` points to `src/` directory
- `tsconfig.app.json` - TypeScript configuration for application code
  - Target: ES2020
  - Strict type checking enabled
- `tsconfig.node.json` - TypeScript configuration for Node.js code
  - Target: ES2022
  - Includes only `vite.config.ts`

## Testing Information

### Testing Setup

This project uses Vitest as the test runner and React Testing Library for testing React components.

1. Install testing dependencies (if not already installed):
   ```bash
   pnpm add -D vitest jsdom @testing-library/react @testing-library/jest-dom
   ```

2. Configure Vitest:
   - Create `vitest.config.ts` at the project root
   - Configure the JSDOM environment for testing React components
   - Set up path aliases to match the main project configuration

### Running Tests

- Run tests once:
  ```bash
  pnpm test
  ```

- Run tests in watch mode:
  ```bash
  pnpm test:watch
  ```

### Writing Tests

1. Create test files with the `.test.tsx` or `.test.ts` extension next to the files they test.
2. Use React Testing Library to render and interact with components.
3. Use Jest-DOM matchers for assertions about the DOM.

Example test for a component:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });
});
```

## Code Style and Development Practices

### Code Formatting

This project uses Prettier for code formatting with the following configuration:
- Semi-colons: enabled
- Tab width: 2 spaces
- Print width: 100 characters
- Single quotes: enabled
- Trailing commas: ES5
- Bracket spacing: enabled
- End of line: auto

Run formatter:
```bash
pnpm format
```

Check formatting:
```bash
pnpm format:check
```

### Linting

This project uses ESLint with the following configuration:
- Extends recommended configurations for JavaScript and TypeScript
- Includes plugins for React Hooks and React Refresh
- Strict TypeScript checking enabled

Run linter:
```bash
pnpm lint
```

### Component Structure

- UI components are located in `src/components/ui/`
- Components use Tailwind CSS for styling
- Class names are managed with `class-variance-authority` and the `cn` utility function

### Path Aliases

Use the `@` alias to import from the `src` directory:

```tsx
// Instead of
import { Button } from '../../components/ui/button';

// Use
import { Button } from '@/components/ui/button';
```

### TypeScript Best Practices

- Enable strict mode for all TypeScript files
- Use explicit return types for functions
- Use interfaces for object types
- Use type guards to narrow types

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
