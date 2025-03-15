# CLAUDE.md for gantt-task-react

## Build/Test/Lint Commands
- Build: `npm run build`
- Test all: `npm run test`
- Run single test: `npx vitest run src/test/file.test.tsx`
- Watch tests: `npm run test:watch`
- Lint: `npm run test:lint`
- Start dev: `npm run start`
- Example app: `cd example && npm start`

## Code Style Guidelines
- TypeScript with strict mode enabled (strictNullChecks: true)
- React functional components with explicit type interfaces
- 2-space indentation, 80 character line width
- Double quotes for strings
- camelCase for variables/functions, PascalCase for components/types
- CSS modules for styling (.module.css files)
- Use explicit type annotations (avoid `any`)
- Named exports preferred over default exports
- Comprehensive test coverage using Vitest
- Organized directory structure by component type