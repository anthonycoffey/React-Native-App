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
    - Resolved an initial 401 error by ensuring `UserContext.tsx` waited for an `isApiConfigured` flag from `AuthContext.tsx`.
- **Architectural Refactor: Migrated User Data Fetching to AuthContext:**
    - To definitively resolve race conditions with user data fetching (`/users/me`), the responsibility for fetching and managing `currentUser` has been moved from `UserContext.tsx` to `AuthContext.tsx`.
    - `AuthContext.tsx` now:
        - Defines a comprehensive `User` interface.
        - Fetches user data when a session becomes active and `apiService` is configured.
        - Manages `currentUser` and `isUserLoading` states.
        - The logic for setting `isApiConfigured` (deferred to the next event tick) remains to ensure `apiService` token is set before fetch.
    - `UserContext.tsx` has been simplified to only manage non-authentication-related user state (e.g., `isClockedIn`). It no longer handles `currentUser` or its fetching.
    - Components previously using `currentUser` from `useUser()` (e.g., `app/job/[id].tsx`) have been updated to use `currentUser` from `useAuth()`.
    - This change centralizes authentication and user identity management, providing a more robust and synchronized state.
    - A temporary 5-second delay (used for earlier diagnosis) was removed from `UserContext.tsx` as part of this refactor.
- **Updated `components/job/CommentItem.tsx` for Edit/Delete Buttons:**
    - Replaced text-based `PrimaryButton` and `SecondaryButton` with smaller, iconic buttons using `MaterialIcons` (`edit` and `delete`) wrapped in `TouchableOpacity`.
    - Ensured icons use theme-aware colors (`useThemeColor` for edit icon, `buttonVariants.error` from `constants/Colors` for delete icon).
    - Corrected `User` type import from `contexts/UserContext` to `contexts/AuthContext`.
- **Updated Job Cancellation Dialog in `components/job/JobStatus.tsx`:**
    - Arranged "Go Back" and "Cancel Job" buttons in a row with space-between justification for left/right alignment.
    - "Go Back" button (left) changed to a standard `OutlinedButton` (no variant) for less visual prominence.
    - "Cancel Job" button (right, destructive) remains a `PrimaryButton` with `variant='error'`.
    - Removed full-width styling from individual buttons, allowing them to size naturally within the new row container.
- **Refactored Comments Section into `JobComments.tsx` Component:**
    - Created new component `components/job/JobComments.tsx`.
    - Moved all comment-related state, handlers (add, edit, delete, modal control), JSX (collapsible section, list, modal), and styles from `app/job/[id].tsx` to `JobComments.tsx`.
    - The new `JobComments` component now encapsulates all comment functionality and is rendered within `app/job/[id].tsx`, receiving necessary props like `jobId`, `jobComments`, `currentUserId`, and `fetchJob`.
- **Documented Theming Strategy:**
    - Analyzed `components/job/CommentModal.tsx` to understand its light/dark mode implementation.
    - Updated `memory-bank/systemPatterns.md` with a detailed description of the standard theming approach, emphasizing the use of `useColorScheme`, themed components from `@/components/Themed`, and helper functions from `hooks/useThemeColor.ts`. This documented pattern is to be followed for all components.
- **Implemented Editable Customer Information in `CustomerInfo.tsx`:**
    - Added functionality to edit Customer Name, Customer Email, Service Address, and Car details.
    - Created new modal components for editing: `components/job/modals/EditNameModal.tsx`, `components/job/modals/EditEmailModal.tsx`, `components/job/modals/EditAddressModal.tsx`, and `components/job/modals/EditCarModal.tsx`.
    - Updated `types.ts` to allow `Car.vin` to be `string | null`.
    - Modified `components/job/CustomerInfo.tsx` to include state for editable fields (including email), edit icons, modal integration, and API save handlers.
    - Ensured `fetchJob` prop is passed from `components/job/JobDetailsAndMapButtons.tsx` to `CustomerInfo.tsx` with the correct type (`() => Promise<void>`).
    - All new UI elements adhere to the established theming strategy.
    - API calls for saving data use `utils/ApiService.ts` and `Alert.alert` for notifications. Service Address updates are now sent to `PATCH /jobs/:id` with the full job object, instead of `PATCH /address/:addressId`.
    - Refined styling in `EditNameModal.tsx` and `EditEmailModal.tsx` to ensure full-width text inputs, consistent with `CommentModal.tsx`, by adjusting `modalView.alignItems` to `stretch`.

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
- The primary mechanism for resolving the 401 error during user data fetching (`/users/me`) is now the migration of user fetching logic directly into `AuthContext`. This ensures that `apiService` is correctly configured with the session token by `AuthContext` itself before it attempts to fetch user data. The `isApiConfigured` flag and its deferred setting support this by managing the precise timing of when the user fetch occurs relative to token setup.
