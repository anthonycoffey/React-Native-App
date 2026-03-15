# Technician App (Phoenix Mobile)

Native mobile application for field technicians, built with React Native and Expo.

## 🚀 Spec-Driven Development — ALWAYS FOLLOW
IMPORTANT: Never start coding without a spec.
1. Read the Agent Brief: `../phoenix-docs/documentation/agents/technician-app.md`
2. Find the active spec in `../phoenix-docs/specs/active/` for your current task.
3. Follow the design and tasks defined in the spec exactly.
4. Update the spec's task list in `phoenix-docs` as you complete work.

## 🛠 Commands
- `npm start`: Start Expo development server
- `npm run ios`: Run on iOS simulator
- `npm run android`: Run on Android emulator
- `npm run test`: Run Jest tests
- `npm run lint`: Run ESLint
- `npx expo install`: Install dependencies with version matching

## 🏗 Architecture
- Framework: Expo (Managed Workflow)
- Routing: Expo Router (File-based)
- Components: `src/components/`
- Screens: `src/screens/`
- State: Custom hooks and React Context

## ✅ Boundaries
- **TDD is Mandatory:** Write unit tests for logic and components before implementation.
- **Clean Code:** PascalCase for components, camelCase for props/functions.
- **Performance:** Optimize FlatLists and use memoization where appropriate.
- **Commits:** Use [Conventional Commits](https://www.conventionalcommits.org/).
