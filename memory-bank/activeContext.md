# Active Context

This document details the current work focus, recent changes, next steps, active decisions and considerations, important patterns and preferences, learnings, and project insights.

## Current Work Focus

Updating the account deletion API endpoint and ensuring robust Memory Bank documentation.

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
  - Resolved an initial 401 error by ensuring user data fetching waited for the session to be established and authorization header to be set in `apiService`.
- **Architectural Refactor: Migrated User Data Fetching to AuthContext:**
  - To definitively resolve race conditions with user data fetching (`/users/me`), the responsibility for fetching and managing `currentUser` has been moved from `UserContext.tsx` to `AuthContext.tsx`.
  - `AuthContext.tsx` now:
    - Defines a comprehensive `User` interface.
    - Fetches user data when a `session` becomes active (which also triggers setting the token in `apiService`).
    - Manages `currentUser` and `isUserLoading` states.
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
- **Updated `components/job/CommentItem.tsx` for Condensed Layout:**
  - Reduced padding, margins, font sizes, and line heights to make individual comments take up less vertical space.
  - Corrected the import path for the `User` type from `contexts/AuthContext` to `types` to resolve a TypeScript error.
- **Refactored and Standardized `Card` Component:**
  - Relocated `Card.tsx` from `components/common/` to `components/Card.tsx`.
  - Updated `Card.tsx` to use the standard page background color (`useThemeColor({}, 'background')`), a theme-aware border, and a theme-aware shadow (new `shadow` property added to `constants/Colors.ts`).
  - Standardized `Card` usage in `app/dashboard/create-job.tsx`, replacing local styles with the shared component.
  - Updated `app/dashboard/account.tsx` to use the new `Card` import path and ensured its internal text elements correctly use themed colors.
  - Updated `components/Typography.tsx` (`LabelText`) to rely on `ThemedText` for color, ensuring consistency.
- **Refactored Discounts Feature:**
  - Updated `types.ts` with `ApiDiscountCode` and `NewDiscountData` types for the new discount functionality.
  - Created `components/job/DiscountList.tsx` to display the list of discounts and handle removal confirmation.
  - Created `components/job/modals/DiscountFormModal.tsx` to provide a comprehensive form for adding discounts, including support for fixed amounts, percentages, and fetching/using predefined discount codes. It handles internal state for form inputs, fetches discount codes from `/discount-codes/active`, calculates discount impacts, and provides validation.
  - Refactored `components/job/Discounts.tsx` to:
    - Utilize the new `DiscountList` and `DiscountFormModal` components.
    - Calculate `lineItemsTotal` (from `job.JobLineItems`) and `discountsTotal`.
    - Pass `jobTotalBeforeDiscounts` (which is `lineItemsTotal`) to the `DiscountFormModal`.
    - Manage loading states and API interactions for adding/removing discounts.
    - Use the standard `Card` component for its main layout.
  - Ensured all new components adhere to theming and project patterns.
- **Added Job Creation page**
  - Created `app/dashboard/create-job.tsx` for the job creation interface.
  - Implemented form elements for job details, including customer information, service address, and vehicle details.
  - Integrated validation and error handling for form submissions.
  - Integrated Address Autocomplete using Google Places API.
  - Integrated Date/Time picker for job scheduling.
  - Integrated Customer Search functionality and New Customer Form to select existing customers or create new ones.
- **Implemented Custom Address Autocompletion (using `expo-crypto`):**
  - Uninstalled `uuid` and `@types/uuid`.
  - Installed `expo-crypto`.
  - Updated `app/dashboard/create-job.tsx` to use `Crypto.randomUUID()` for Google Places API session tokens.
  - Retained custom logic for fetching suggestions (Google Places Autocomplete API) and details (Google Places Details API) via `fetch`.
  - Suggestions are displayed in a `View` with `.map()`, replacing the `FlatList` to avoid the nested VirtualizedList warning.
  - Changed the Service `DropDownPicker`'s `listMode` to `'MODAL'` to also avoid the nested VirtualizedList warning.
- **Refactored DateTimePicker for Job Creation:**
  - Updated `app/dashboard/create-job.tsx` to use the imperative `DateTimePickerAndroid.open()` API for Android, similar to the pattern in `components/job/ArrivalTime.tsx`.
  - This involves separate chained calls for date and then time selection on Android.
  - For iOS, the existing declarative `DateTimePicker` with `mode="datetime"` is retained.
  - This change aims to provide a more stable date/time picking experience on Android and resolve the "Cannot read property 'dismiss' of undefined" error.
- **Fixed Location Update Interval in `hooks/useLocation.ts`:**
  - Identified that the `apiService.post('/user/geolocation', ...)` call was not repeating at the intended `UPDATE_INTERVAL`.
  - The issue was caused by `pendingUpdateRef.current` being reset with a 1-second delay via `setTimeout` in the `finally` block of `updateServerLocation`.
  - Modified `updateServerLocation` to reset `pendingUpdateRef.current = false` immediately within the `finally` block, removing the `setTimeout`. This allows subsequent location updates from `watchPositionAsync` to proceed without unnecessary skips, ensuring the API call frequency aligns better with `UPDATE_INTERVAL`.
- **Implemented Background Location Tracking using `expo-task-manager`:**
  - Installed `expo-task-manager` package.
  - Modified `hooks/useLocation.ts`:
    - Added `TaskManager.defineTask` at the top level to define `background-location-task`. This task handles sending location updates to the `/user/geolocation` API endpoint.
    - Updated `checkPermissions` to request and verify both foreground and background location permissions.
    - Replaced `Location.watchPositionAsync` with `Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, ...)` to initiate background-capable location tracking.
    - Updated `stopLocationUpdates` to use `Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)`.
    - Removed all `console.log` statements and minimized comments as requested.
  - Confirmed `app.json` already had necessary configurations for background location modes on iOS and Android.
- **Refactored Styling for Login and Registration Pages:**
  - Modified `styles/globalStyles.ts`:
    - Changed `inputContainer` background to `transparent`.
    - Added new theme-aware structural styles: `themedFormInput`, `themedPasswordInputWrapper`, `themedPasswordTextInput`.
    - Removed old `input`, `inputPrice` styles and hardcoded color from `label` style.
  - Updated `app/register.tsx` and `app/login.tsx`:
    - Consistently used `globalStyles.inputContainer` for input field wrappers.
    - Applied new global input styles (`themedFormInput`, `themedPasswordInputWrapper`, `themedPasswordTextInput`) with inline themed colors.
    - Ensured `LabelText` is used for labels where appropriate.
- **Implemented User Registration:**
  - Created `app/register.tsx` with a registration form (First Name, Last Name, Email, Phone, Password, Confirm Password).
  - First Name and Last Name fields are displayed on the same row.
  - Implemented client-side validation: required fields, password match, strong password policy.
  - Integrated API call to `POST /users/signup`.
  - On success, navigates to `/login` with email pre-filled.
  - Displays API errors.
  - Added navigation link to login page.
  - Ensured consistent theming for light/dark modes.
  - Added `register` screen to `app/_layout.tsx` with `headerShown: false`.
- **Updated `app/login.tsx`:**
  - Added functionality to accept an `email` parameter for autofill.
  - Added a navigation link to the new `/register` page.
  - Improved theming consistency.
  - Standardized password visibility toggle state and function names to match `app/register.tsx` (`isPasswordVisible`, `togglePasswordVisibility`).
- **Updated Login and Registration Page Styling:**
  - Added a new `brand` color (`#252d3a`) to `constants/Colors.ts`.
  - Updated `app/login.tsx` and `app/register.tsx` to use this `brand` color for their main background.
  - Corrected styling for password input fields in `app/register.tsx` to ensure proper theme-aware rendering.
  - Ensured both pages are scrollable using `ScrollView`.
- **Enhanced Job File Uploads with Camera Integration:**
  - Installed `expo-camera` dependency.
  - Created `components/job/CameraCaptureModal.tsx` to provide a dedicated camera interface for taking photos. This modal handles camera permissions, displays a preview, and allows capturing a single image.
  - Modified `components/job/JobFiles.tsx`:
    - Replaced the single "Upload File(s)" button with two icon buttons: a "camera" icon to launch `CameraCaptureModal.tsx` and a "folder" icon to use the existing `expo-document-picker` functionality.
    - Integrated the `CameraCaptureModal` and its callback to handle uploading the captured image.
    - The document picker is now configured to primarily suggest images (`type: ['image/*']`).
  - Removed all code comments from `components/job/CameraCaptureModal.tsx` and `components/job/JobFiles.tsx` as per user request.
  - Updated `app.json` by adding the `expo-camera` plugin to ensure correct camera permissions are configured for iOS and Android. The plugin includes a usage description: "Allow $(PRODUCT_NAME) to access your camera to take photos for job documentation."
- **Implemented Lost Password Page:**
  - Installed `react-native-webview` dependency.
  - Created `app/lost-password.tsx` screen featuring a `WebView` pointing to `https://app.24hrcarunlocking.com/reset-password`.
  - Added a "Back to Login" button on the `lost-password` screen.
  - Added a "Forgot Password?" link on `app/login.tsx` navigating to the new screen.
  - Included `lost-password` in the root navigation layout (`app/_layout.tsx`) with `headerShown: false`.
- **Implemented Phone Number Formatting on Registration Page:**
  - Added a `formatPhoneNumber` utility function to `utils/strings.ts` to format numbers as `XXX-XXX-XXXX`.
  - Updated `app/register.tsx` to use this utility for the phone number input field, providing real-time formatting as the user types.
  - Set `maxLength={12}` for the phone input field.
- **Account Deletion Request:**
  - Added a "Delete Account" button to the account screen (`app/dashboard/account/index.tsx`).
  - The button triggers a confirmation dialog before sending a `POST` request to `/account/delete`.
  - The user is notified of the request's success or failure via an alert.
  - The user is not logged out upon successful request.
- **Updated Account Deletion Endpoint:**
  - Changed the API call in `app/dashboard/account/index.tsx` from `apiService.post('/account/delete')` to `apiService.delete('/account/delete')` to match the API documentation.
- **Enhanced Account Deletion with Confirmation Modal:**
    - Created a new `DeleteAccountModal.tsx` component in `components/account/`.
    - This modal requires the user to type "delete" to confirm the action.
    - Replaced the standard `Alert.alert` with the new custom modal in `app/dashboard/account/index.tsx`.
    - The user is now logged out and redirected to the login screen after a 1-second delay for a smoother user experience.

## Next Steps

- **Finalize Memory Bank Update:** Complete updates to `progress.md` to reflect the new Lost Password page.
- **Testing:** Thoroughly test the new camera upload functionality and existing file picker functionality on both iOS and Android.
- **Identify and document any `Known Issues`** that arise during testing or further development.
- **Continue Project Work:** Proceed with the next development task based on the priorities outlined in `projectbrief.md` and `progress.md` once Memory Bank is up-to-date and current features are stable.
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
- The primary mechanism for resolving potential 401 errors during initial user data fetching (`/users/me`) is the migration of user fetching logic directly into `AuthContext.tsx`. This ensures that `apiService` is correctly configured with the session token (derived from the `session` state) by `AuthContext` itself before it attempts to fetch user data. The presence of a valid `session` is the key condition for proceeding with user data fetching.
