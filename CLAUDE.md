# GPTNative - Commands and Conventions

## Commands
- Start: `npm start` or `yarn start`
- Development: `npm run ios`, `npm run android`, `npm run web`
- Testing: `npm test` (runs Jest with watchAll)
- Linting: `npm run lint` (uses expo lint)
- Build: `npm run build:ios`, `npm run build:android`, `npm run build:simulator`

## Code Style
- **Formatting**: 2-space indentation, semicolons required, Prettier enforced
- **Imports**: React first, then external libraries, then project imports via `@/` aliases
- **Types**: Use TypeScript strict mode, explicit interface definitions for props and API responses
- **Naming**: Components/interfaces in PascalCase, variables/functions in camelCase
- **Components**: One component per file, matching filename to export name
- **Error Handling**: Try/catch for async operations, specific error.response checks
- **State Management**: React Context for global state (AuthContext, UserContext)
- **Styling**: Mix of React Native StyleSheet and inline styles