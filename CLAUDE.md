# GPTNative - Commands and Conventions

## Commands
- Start: `npm start` or `yarn start`
- Development: `npm run ios`, `npm run android`, `npm run web`
- Production: `npm run prod` (starts Expo with --no-dev flag)
- Testing: 
  - All tests: `npm test` (runs Jest with --watchAll)
  - Single test: `npx jest -t "test name"` or `npx jest path/to/test-file.js`
- Linting: `npm run lint` (uses expo lint)
- Building:
  - iOS: `npm run build:ios`
  - Android: `npm run build:android`
  - iOS Simulator: `npm run build:simulator`
  - Run build: `npm run build:run`
- Update: `npm run update` (runs eas update)

## Code Style
- **Formatting**: 2-space indentation, semicolons required, Prettier enforced
- **Imports**: Order: React first, external libraries, project imports via `@/` aliases
- **Types**: TypeScript strict mode, explicit interfaces for props/responses
- **Naming**: PascalCase for components/interfaces, camelCase for variables/functions
- **Components**: Suggested one component per file, filename matches export name
- **Error Handling**: Try/catch for async ops, check error.response details
- **State Management**: React Context for global state (AuthContext, UserContext)
- **Testing**: Jest with react-test-renderer, use snapshot testing
- **Styling**: Mix of React Native StyleSheet and inline styles