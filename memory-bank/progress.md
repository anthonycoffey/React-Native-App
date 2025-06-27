# Progress

This document tracks what works, what's left to build, the current status, known issues, and the evolution of project decisions.

## What Works

- Memory Bank core file structure has been initialized.
- `projectbrief.md` populated with core requirements and project goals based on user input.
- `productContext.md` populated with problem statement, proposed solution, how it works, and user experience goals based on user input.
- `systemPatterns.md` populated with initial system architecture, key technical decisions, design patterns, component relationships, and critical implementation paths based on user input and project structure.
- `techContext.md` populated with technologies used, development setup, initial technical constraints, and tool usage patterns based on user input and `README.md`.
- Updated `components/job/JobFiles.tsx` to replace `TouchableOpacity` with `PrimaryButton` in the image viewing modal and to display images in a gallery format.
- **Job Comment Functionality:** Implemented view, add, edit, and delete capabilities for job comments.
  - Created `CommentItem.tsx`, `CommentModal.tsx`, `CommentsList.tsx`.
  - Integrated into `app/job/[id].tsx`.
  - Added `JobComment` type to `types.ts`.
  - Refactored `CommentsList.tsx` to use `map` instead of `FlatList` to prevent nested VirtualizedList issues.
  - Enhanced comments section in `app/job/[id].tsx` to be collapsible.
  - Added client-side pagination to `CommentsList.tsx`.
- **User Data Fetching Architecture:**
    - Migrated user data (`/users/me`) fetching logic from `UserContext.tsx` to `AuthContext.tsx`.
    - `AuthContext.tsx` now manages `currentUser` state and `isUserLoading` state, fetching user data directly when a session is active and `apiService` is configured.
    - `UserContext.tsx` is simplified, focusing on non-authentication-related user state like `isClockedIn`.
    - Components consuming `currentUser` (e.g., `app/job/[id].tsx`) were updated to use `useAuth()`.
    - This architectural change resolves previous race conditions related to user data fetching and API readiness signaling.
- **Comment Item UI Update:**
    - Modified `components/job/CommentItem.tsx` to replace text-based edit/delete buttons with smaller, iconic `MaterialIcons` buttons (`edit`, `delete`).
    - Ensured icons use appropriate theme-aware colors.
    - Resolved associated TypeScript errors by correcting `User` type import and using `buttonVariants.error` for delete icon color.
- **Job Cancellation Dialog UI Update (in `components/job/JobStatus.tsx`):**
    - Adjusted button layout for "Go Back" and "Cancel Job" to be space-between justified (left/right alignment).
    - Updated "Go Back" button to a standard `OutlinedButton` for neutral styling.
    - Ensured "Cancel Job" (destructive) button retains its error styling.
    - Removed full-width properties from individual buttons in the dialog.
- **Comments Section Refactor:**
    - Extracted comments functionality from `app/job/[id].tsx` into a new dedicated component: `components/job/JobComments.tsx`.
    - This new component now manages its own state, handlers, and JSX for displaying comments, the comment modal, and related actions.
    - `app/job/[id].tsx` has been simplified by removing the direct comments logic and now renders the `JobComments` component.
- **Proxy management functionality:**
    - Created `JobProxy.tsx` component to allow technicians to view/edit active proxy connections.
    - This component is integrated into the job details page and allows for easy management of proxy connections.
    - Includes new phone form to add new phone numbers to the list of customer phone numbers included in the `CustomerPhones` array within the `Customer` object for each `Job`.
- **File uploads functionality:**
    - Created `JobFiles.tsx` component to handle file uploads for job-related documents.
    - Integrated file upload UI into the job details page.
    - Implemented file preview and removal functionality.
    - Video playback support not yet implemented.
- **Theming Strategy Documentation:**
    - Reviewed `components/job/CommentModal.tsx` to understand its light/dark mode styling.
    - Updated `memory-bank/systemPatterns.md` to include a comprehensive section on the app's theming strategy. This includes how to get the current theme, use themed base components, apply theme colors to standard components using `useThemeColor` and its helper functions, and the importance of consistency. This documented pattern is now the standard for all components.
- **Editable Customer Information:**
    - Implemented editing for Customer Name, Customer Email, Service Address, and Car details within `components/job/CustomerInfo.tsx`.
    - Created `EditNameModal.tsx`, `EditEmailModal.tsx`, `EditAddressModal.tsx`, and `EditCarModal.tsx` in `components/job/modals/`.
    - Updated `Car` type in `types.ts` for `vin` to be `string | null`.
    - Integrated modals and API save logic (including for email) into `CustomerInfo.tsx`. Service Address updates now use `PATCH /jobs/:id` with the full job object.
    - Ensured `fetchJob` prop is correctly passed and typed through `JobDetailsAndMapButtons.tsx`.
    - Adhered to theming guidelines for all new UI, including ensuring full-width text inputs in `EditNameModal` and `EditEmailModal` for consistency.
- **Comment Item Condensed Layout:**
    - Updated `components/job/CommentItem.tsx` to reduce padding, margins, font sizes, and line heights for a more compact appearance.
    - Corrected the import path for the `User` type in `components/job/CommentItem.tsx` from `contexts/AuthContext` to `types`, resolving a TypeScript error.
- **Card Component Standardization:**
    - Relocated `Card.tsx` to `components/Card.tsx` (from `components/common/`).
    - Refactored `Card.tsx` for consistent theming: uses page background, theme-aware border, and theme-aware shadow (new `shadow` color added to `constants/Colors.ts`).
    - Standardized `Card` usage in `app/dashboard/create-job.tsx` by replacing local card styles.
    - Updated `app/dashboard/account.tsx` to use the new `Card` import and ensured its internal text elements are themed correctly.
    - Ensured `LabelText` in `components/Typography.tsx` uses themed text color.
- **Discounts Feature Refactor (Vue-inspired):**
    - Added `ApiDiscountCode` and `NewDiscountData` to `types.ts`.
    - Created `components/job/DiscountList.tsx` for displaying discounts and handling removals.
    - Created `components/job/modals/DiscountFormModal.tsx` for adding discounts (fixed, percent, code-based) with API fetching for codes and validation.
    - Refactored `components/job/Discounts.tsx` to integrate the new list and modal components, calculate totals, and manage API interactions. It now uses the standard `Card` component.
- **Custom Address Autocompletion (using `expo-crypto`):**
    - Uninstalled `uuid` and `@types/uuid`. Installed `expo-crypto`.
    - Updated `app/dashboard/create-job.tsx` to use `Crypto.randomUUID()` for session tokens.
    - Custom implementation for Google Places Autocomplete and Details APIs using `fetch` and a `View` with `.map()` for suggestions is in place.
    - Changed Service `DropDownPicker`'s `listMode` to `'MODAL'` to address nested VirtualizedList warning.
- **DateTimePicker Refactor for Job Creation (Android Stability):**
    - The `DateTimePicker` in `app/dashboard/create-job.tsx` was refactored to use the imperative `DateTimePickerAndroid.open()` API for Android.
    - This involves a two-step process for Android users: selecting the date, then selecting the time, with separate handlers (`handleAndroidDateChange`, `handleAndroidTimeChange`).
    - The iOS implementation remains a single declarative `DateTimePicker` with `mode="datetime"`.
    - This change, mirroring the pattern in `components/job/ArrivalTime.tsx`, is intended to resolve the "Cannot read property 'dismiss' of undefined" error on Android by providing a more stable interaction with the native date/time pickers.
- **Background Location Tracking:**
    - Implemented background location tracking using `expo-task-manager`.
    - Installed `expo-task-manager`.
    - Modified `hooks/useLocation.ts` to define a background task (`background-location-task`) for sending location updates, updated permission requests for background access, and switched from `watchPositionAsync` to `startLocationUpdatesAsync` and `stopLocationUpdatesAsync`.
    - Ensured `app.json` was already correctly configured for background location.
- **Styling Refactor for Login/Registration Pages:**
    - Updated `styles/globalStyles.ts` with new theme-aware input styles (`themedFormInput`, `themedPasswordInputWrapper`, `themedPasswordTextInput`) and made `inputContainer` background transparent. Removed old/unused input styles.
    - Refactored `app/login.tsx` and `app/register.tsx` to use these new global styles, ensuring consistent structure and theming for input fields.
- **User Registration Feature:**
    - Created `app/register.tsx` with a complete registration form.
    - Implemented client-side validation (required fields, password match, strong password).
    - Integrated with `POST /users/signup` API endpoint.
    - Redirects to login page with email autofill on successful registration.
    - Added navigation links between login and registration pages.
    - Ensured consistent light/dark mode theming.
    - Arranged First Name and Last Name fields on the same row.
    - Added to root `_layout.tsx` with `headerShown: false`.
- **Login Page Updates (`app/login.tsx`):**
    - Enabled email autofill from registration.
    - Added link to the registration page.
    - Improved theming consistency.
    - Standardized password visibility toggle state and function names to match `app/register.tsx` (`isPasswordVisible`, `togglePasswordVisibility`).
- **Enhanced Job File Uploads with Camera Integration:**
    - Installed `expo-camera` dependency.
    - Created `components/job/CameraCaptureModal.tsx` for direct photo capture.
    - Modified `components/job/JobFiles.tsx` to include separate icon buttons for camera and file picker, integrating the new camera modal.
    - Removed all code comments from `components/job/CameraCaptureModal.tsx` and `components/job/JobFiles.tsx`.
    - Updated `app.json` with the `expo-camera` plugin to handle camera permissions.
- **Lost Password Page:**
    - Installed `react-native-webview` dependency.
    - Created `app/lost-password.tsx` screen with a `WebView` for the password reset URL.
    - Added a "Back to Login" button on the `lost-password` screen.
    - Added a "Forgot Password?" link on `app/login.tsx` to navigate to the new screen.
    - Integrated the `lost-password` screen into the main navigation stack in `app/_layout.tsx`.
- **Phone Number Formatting (Registration Page):**
    - Added `formatPhoneNumber` utility to `utils/strings.ts` for `XXX-XXX-XXXX` formatting.
    - Integrated into `app/register.tsx` phone input for real-time formatting and set `maxLength={12}`.
- **Account Deletion Request:**
    - Added a "Request Account Deletion" button to the account screen (`app/dashboard/account/index.tsx`).
    - The button triggers a confirmation dialog before sending a `POST` request to `/account/delete`.
    - The user is notified of the request's success or failure via an alert.

## What's Left to Build

- **Refine `systemPatterns.md`:**
    - Verify API communication details by reviewing `utils/api.ts`.
    - Confirm styling approach by inspecting component files.
    - Detail offline support strategy if any.
    - Verify HOC usage.
    - Detail API error handling and form handling patterns by reviewing relevant code.
    - Verify the exact screen for listing jobs.
- **Refine `techContext.md`:**
    - Specify Node.js version if a strict requirement exists.
    - Detail any specific IDE extensions or configurations beyond standard ESLint.
    - Clarify minimum OS version support if known.
    - Document performance targets or known limitations.
    - List any critical constraints from the backend API.
- **Populate `Known Issues`:** Document any existing bugs or known problems with the application.

## Current Status

- Memory Bank core files have been initialized and populated with initial project information.
- Further refinement and detail are needed in several sections, particularly `systemPatterns.md` and `techContext.md`, requiring code review and potentially more specific user input.
- The Memory Bank provides a foundational understanding of the project.

## Known Issues

*(To be filled in)*

## Evolution of Project Decisions

*(To be filled in)*
