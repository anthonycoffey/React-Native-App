# Active Context

This document details the current work focus, recent changes, next steps, active decisions and considerations, important patterns and preferences, learnings, and project insights.

## Current Work Focus

Implementing Job File Management feature and ongoing Memory Bank refinement.

## Recent Changes

- Initialized all core Memory Bank files.
- Populated `projectbrief.md` with core requirements and project goals.
- Populated `productContext.md` with problem statement, solution, and UX goals.
- Populated `systemPatterns.md` with initial architectural details, technical decisions, and patterns.
- Populated `techContext.md` using user input and information from `README.md`.
- Updated `progress.md` to reflect the current state of Memory Bank population.
- Implemented file upload, view, and delete functionality in `components/job/JobFiles.tsx` and integrated into `app/job/[id].tsx`.
- Conducted a comprehensive review of all components in the `components/` directory (root and `job/` subdirectory).
- Updated `systemPatterns.md` with detailed findings from the component review.
- **Updated `components/job/JobFiles.tsx`:**
    - Replaced `TouchableOpacity` with `PrimaryButton` in the `FileViewerModal` for the close action.
    - Changed the file list display to a gallery format for image files, showing previews. Non-image files are still displayed in a list format.
- **Implemented Job Comment Functionality:**
    - Added `JobComment` type to `types.ts`.
    - Created `CommentItem.tsx`, `CommentModal.tsx`, and `CommentsList.tsx` components.
    - Integrated comment viewing, adding, editing, and deleting into `app/job/[id].tsx`.
    - Updated `CommentsList.tsx` to use `map` instead of `FlatList` to avoid nested VirtualizedList issues.
    - Made the comments section in `app/job/[id].tsx` collapsible.
    - Added client-side pagination to `CommentsList.tsx`.
- **Resolved 401 Error for User Fetching:**
    - Introduced an `isApiConfigured` flag in `AuthContext.tsx` to signal when the Axios interceptor is ready.
    - Modified `UserContext.tsx` to wait for `isApiConfigured` to be true before fetching user data, preventing requests without an auth token.
- **Added 5s Delay to User Fetch:** Introduced a 5-second delay in `contexts/UserContext.tsx` before the `/users/me` API call to help test race conditions.

## Next Steps

- **Refine Memory Bank:**
    - Conduct code reviews of key files (e.g., `utils/api.ts`, component files) to verify and add detail to `systemPatterns.md` (API communication, styling, error handling, form patterns, job listing screen).
    - Gather more specific details for `techContext.md` (Node.js version, specific IDE extensions, OS version support, performance targets, backend API constraints).
    - Identify and document any `Known Issues`.
- **Continue Project Work:** Proceed with the next development task based on the priorities outlined in `projectbrief.md` and `progress.md`.
- Continuously update all Memory Bank files as new information is gathered or decisions are made.

## Active Decisions & Considerations

- Prioritizing comprehensive Memory Bank population before diving deep into feature development to ensure a solid understanding of the existing project.
- Determining the level of detail required for each Memory Bank section to be useful without being overly verbose.

## Important Patterns & Preferences

- The project relies heavily on Expo for its build system, development tools, and core native functionalities.
- Custom-built UI components are preferred over external libraries.
- State management is handled via React Context API for global state and local component state.
- `README.md` serves as a critical source of initial setup and operational information.

## Learnings & Project Insights

- The `README.md` file provided significant initial context for `techContext.md`, highlighting its importance for onboarding and understanding development practices.
- A structured approach to populating the Memory Bank, by addressing each core file systematically, helps ensure comprehensive coverage.
- Iterative refinement of Memory Bank documents will be necessary as deeper insights into the codebase are gained.
- The component review (May 14, 2025) provided a good overview of the existing UI building blocks. Key takeaways include:
    - A consistent theming strategy is emerging based on `components/Themed.tsx` and `hooks/useThemeColor.ts`.
    - A set of standardized buttons (`components/Buttons.tsx`) and typography elements (`components/Typography.tsx`) are available.
    - Job-specific components in `components/job/` are generally well-structured and handle significant pieces of functionality.
    - Some older components or specific style instances are not fully theme-aware and could be refactored for better consistency.
    - Minor redundancies in functionality were noted (e.g., two `CurrencyInput` components, overlapping map button logic), offering future consolidation opportunities.
- Resolved a 401 error during user data fetching (`/users/me`) by ensuring the API request in `UserContext` only fires after `AuthContext` has fully configured the Axios interceptor with the session token. This was achieved by introducing an `isApiConfigured` flag in `AuthContext`.
