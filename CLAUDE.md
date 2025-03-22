# GPT Native Codebase Guide

## Commands
- Start app: `cd React-Native-App && npm start`
- Start specific platform: `cd React-Native-App && npm run ios` or `npm run android`
- Production build: `cd React-Native-App && npm run prod`
- Run tests: `cd React-Native-App && npm test`
- Run single test: `cd React-Native-App && npx jest -t "test name"` 
- Linting: `cd React-Native-App && npm run lint`

## Code Style
- **TypeScript**: Use strict typing with interfaces/types for props
- **Imports**: Group by 1) React/RN, 2) External libs, 3) Project imports with @/ alias
- **Components**: Functional components with hooks, typed props
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Folders**: Feature-based organization with component subfolders
- **Styling**: Use StyleSheet.create() or Tamagui styling
- **Error Handling**: Try/catch blocks with appropriate user feedback
- **State Management**: React Context API with custom hooks

## UI Guidelines
- Use themed components for consistent dark/light mode support
- Follow Expo Router conventions for navigation