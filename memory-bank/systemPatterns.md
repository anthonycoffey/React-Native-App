# System Patterns

This document outlines the system architecture, key technical decisions, design patterns in use, component relationships, and critical implementation paths.

## System Architecture

1.  **Framework:** Expo React Native application (latest SDK, utilizing React v19).
2.  **API Communication:**
    - The mobile app communicates with the existing backend API (shared with the Phoenix CRM web app) using a custom fetch-based client.
    - The API client implementation is located in `utils/ApiService.ts`.
3.  **Local Data Storage:**
    - **Authentication Token:** Securely stored using `expo-secure-store` (likely managed via `hooks/useStorageState.ts` or within `contexts/AuthContext.tsx`).
    - **Other Persistent State:** Potentially `AsyncStorage` for non-sensitive user preferences or cached data (managed via `hooks/useStorageState.ts`).
    - **In-Memory State:** Managed by React state and Context API for transient data.
4.  **Navigation:**
    - Handled by Expo File System Router (version 3), with routes defined by the file structure within the `app/` directory.
    - Layouts (e.g., `app/_layout.tsx`, `app/dashboard/_layout.tsx`) define shared UI and protection for route segments.

## Key Technical Decisions (Mobile App Specific)

1.  **UI Components:**
    - The project features a local component library organized within the `components/` directory, with general-purpose components at the root and feature-specific ones (e.g., for "job") in subdirectories.
    - Core UI building blocks like themed text and views (`components/Themed.tsx`), standardized buttons (`components/Buttons.tsx`), and typography helpers (`components/Typography.tsx`) form the base.
    - While many UI elements are custom-built, the project also integrates some third-party UI libraries for specific functionalities:
      - `@react-native-community/datetimepicker` for date/time selection.
      - `react-native-dropdown-picker` for dropdown/select inputs.
      - `react-native-map-link` for integration with map applications.
      - `expo-camera` for direct camera access and image capture.
      - `expo-image-picker` for selecting files from device storage.
2.  **State Management:**
    - **Global State:** React Context API is used for managing global state:
      - `contexts/AuthContext.tsx`: Manages the user's `session` (authentication token) and the authenticated user's data (`currentUser`). It fetches user data upon successful establishment of a `session` (which also involves setting the token in `apiService`). The presence of a non-null `session` indicates that the API client is configured with an auth token.
      - `contexts/UserContext.tsx`: Manages other user-specific states not directly tied to authentication, such as `isClockedIn`.
      - `contexts/NotificationsContext.tsx`: Manages the state of in-app notifications, including the list of notifications and the unread count. It also handles loading notifications from and saving them to `AsyncStorage`.
      - `contexts/LocationContext.tsx`: Manages location tracking state (current location, permissions, errors) and the lifecycle of background and foreground location updates. It acts as a singleton to ensure consistent tracking across the app.
    - **Local State:** Standard React component state (`useState`, `useEffect`) is used extensively within components for managing their internal data and lifecycle.
3.  **Notifications:**
    - **Engine:** The `expo-notifications` library is used to handle all aspects of local and push notifications.
    - **Permissions & Listeners:** The `hooks/useNotifications.ts` custom hook is responsible for requesting permissions, setting up notification handlers, and establishing listeners for incoming notifications. It is initialized once in the root layout (`app/_layout.tsx`). The hook's `useEffect` is tied to the `auth.session`, ensuring that the push notification registration and subscription to the backend API occurs automatically after a user logs in.
    - **Storage:** Received notifications are saved to `AsyncStorage` to persist them across app sessions.
    - **UI:**
      - A `NotificationBell.tsx` component in the dashboard header displays the unread notification count.
      - A dedicated screen at `app/dashboard/notifications.tsx` displays a history of all received notifications. The items in this list are tappable and will navigate to a linked screen if a `link` is present in the notification data.
    - **Deep Linking:**
      - Push notifications and in-app notifications can be used to navigate the user to a specific screen within the app.
      - **Payload Format:** The backend should include a `link` property within the `data` object of the push notification payload. The link should be a valid deep link string.
      - **Link Structure:** The deep link is constructed using the app's custom URL scheme (`phoenix-mobile` as defined in `app.json`) and the target route path. For example, to navigate to a job with ID `123`, the link would be `phoenix-mobile:///job/123`.
      - **Client-Side Handling (Push Notifications):** The `hooks/useNotifications.ts` file contains a listener (`addNotificationResponseReceivedListener`) that triggers when a user taps a notification from outside the app. This listener extracts the `link` from the payload and uses `router.push(link as any)` to navigate.
      - **Client-Side Handling (In-App Notifications):** The `hooks/useNotifications.ts` file also contains a listener (`addNotificationReceivedListener`) that saves incoming notifications for in-app display. The `link` from the payload is now stored as part of the `StoredNotification` object. The `app/dashboard/notifications.tsx` screen renders these stored notifications, making them tappable and using `router.push(link as any)` to navigate when pressed.
      - The `as any` cast is necessary in both cases to bypass TypeScript's strict type checking for typed routes, as the link is a dynamic string.
4.  **Styling & Theming:**
    - Styling is primarily managed using React Native's `StyleSheet` API.
    - A comprehensive theming system is in place to support light and dark modes consistently across the application. This is the standard approach and **must be followed for all new and existing components**:
      - **Getting the Current Theme:** The current color scheme (e.g., 'light' or 'dark') is obtained using `const theme = useColorScheme() ?? 'light';` (import from `@/components/useColorScheme`).
      - **Themed Base Components:** For fundamental UI elements, use the pre-themed components:
        - `import { Text, View as ThemedView } from '@/components/Themed';`
        - These components automatically adapt their styles (e.g., text color, background color) based on the active theme.
      - **Applying Theme Colors to Standard Components:** When styling standard React Native components (e.g., `TextInput`, `TouchableOpacity`) or requiring specific theme colors for custom styles:
        - Use the `useThemeColor` hook for direct palette access: `const specificColor = useThemeColor({ light: lightColor, dark: darkColor }, 'colorNameInPalette');` or `const backgroundColor = useThemeColor({}, 'background');` (import from `@/hooks/useThemeColor`).
        - Utilize the set of helper functions provided by `hooks/useThemeColor.ts`. These functions take the `theme` string ('light' or 'dark') as an argument:
          - `getBackgroundColor(theme)`
          - `getTextColor(theme)`
          - `getBorderColor(theme)`
          - `getInputBackgroundColor(theme)`
          - `getPlaceholderTextColor(theme)`
          - `getIconColor(theme)`
          - `getLinkColor(theme)`
          - `getButtonTextColor(theme, variant)`
          - `getButtonBackgroundColor(theme, variant)`
          - `getButtonBorderColor(theme, variant)`
        - Example: `style={{ borderColor: getBorderColor(theme), color: getTextColor(theme) }}`.
      - **Color Definitions:** Base color values for light and dark themes are defined in `constants/Colors.ts` (including a `shadow` property for theme-aware shadows). The `useThemeColor` hook and its helpers draw from these definitions.
      - **Custom Components:** Reusable custom components (e.g., `PrimaryButton`, `Chip`, `Card`) are expected to encapsulate their own theme-aware styling using the above mechanisms.
      - **Global Styles:** `styles/globalStyles.ts` contains reusable StyleSheet objects (e.g., `card`, `input`, `label`) that should also be made theme-aware if they involve colors, or be used in conjunction with themed styles.
    - **Consistency Goal:** All components should strive to be fully theme-aware. Hardcoded colors should be avoided unless they are universally applicable (e.g., a standard black shadow or a fixed overlay color that works for both themes). Existing components with hardcoded theme-dependent colors should be refactored.
5.  **Permissions Handling:**
    - Utilizes Expo's permission modules and plugins:
      - `expo-location` (with plugin): For foreground and background location permissions and tracking, managed in `hooks/useLocation.ts`.
      - `expo-image-picker`: For file access when selecting documents/images.
      - `expo-camera` (with plugin): For camera access permissions, managed within `components/job/CameraCaptureModal.tsx` and configured in `app.json`.
    - Background location tracking is implemented using `expo-task-manager` in conjunction with `expo-location`. A defined task (`background-location-task` in `hooks/useLocation.ts`) handles location updates when the app is in the background.
6.  **Offline Support:**
    - Currently, no explicit offline support strategy is documented. Assumed to require network connectivity for most operations. _(To be confirmed/detailed)_

## Design Patterns (Observed or Intended in Mobile App)

1.  **Provider Pattern:** Implemented via React Context API for `AuthContext`, `UserContext`, and `NotificationsContext`.
2.  **Custom Hooks:** Utilized for encapsulating reusable logic (e.g., `hooks/useLocation.ts`, `hooks/useStorageState.ts`, `hooks/useThemeColor.ts`, `hooks/useNotifications.ts`).
3.  **Functional Components with Hooks:** Standard approach for component development.
4.  **File System Routing:** Leveraged from Expo Router.
5.  **Higher-Order Components (HOCs):** Potentially used for route protection or wrapping layouts, though Expo Router's layout mechanism might reduce direct HOC usage for routing. _(To be verified)_
6.  **API Service Abstraction:** API calls are centralized and abstracted in `utils/ApiService.ts`, which provides a custom fetch-based client for interacting with the backend.
7.  **Error Handling:** Specific patterns for API error handling and display to the user. _(To be detailed by reviewing API call implementations)_
8.  **Form Handling:** Patterns for input management, validation, and submission. _(To be detailed as forms are implemented/reviewed)_
    - **Custom Address Autocompletion:** Implemented in `app/dashboard/create-job.tsx` for the service address.
      - Uses a standard `TextInput` for user input.
      - On text change, a debounced function (`debouncedFetchAddressSuggestions`) calls the Google Places Autocomplete API (`https://maps.googleapis.com/maps/api/place/autocomplete/json`) using `fetch`.
      - Requires `EXPO_PUBLIC_GEOCODING_API_KEY` and a `sessiontoken` (generated using `Crypto.randomUUID()` from `expo-crypto`).
      - Suggestions are displayed in a `FlatList` below the input.
      - On selecting a suggestion, its `place_id` is used to call the Google Places Details API (`https://maps.googleapis.com/maps/api/place/details/json`) to get detailed address components.
      - The `addressForm` state is then populated with the parsed components (street, city, state, zip).
      - The `sessiontoken` is renewed after a place detail is fetched.
    - **Dropdowns:** The Service selection uses `react-native-dropdown-picker` with `listMode='MODAL'` to avoid nesting a VirtualizedList within the main `ScrollView`.

## Component Relationships

1.  **Core Navigation Flow (based on `app/` structure):**
    - `app/login.tsx`: Handles user authentication.
    - `app/_layout.tsx`: Root layout, likely sets up global contexts (Auth, User).
    - `app/dashboard/_layout.tsx`: Protected layout for dashboard screens.
      - `app/dashboard/index.tsx`: Main dashboard screen.
      - `app/dashboard/go-online.tsx`: Screen for clock-in/out and location tracking.
    - `app/dashboard/settings.tsx`: User settings.
    - `app/job/[id].tsx`: Detailed view for a specific job.
    - `app/actions/accept-job/[jobId].tsx`: Screen for technicians to accept or decline a dispatched job.
    - A screen for listing jobs is implemented in `JobsList.tsx` which is likely used within a dashboard screen.
2.  **Reusable Components Overview:**
    - **Base UI (`components/`):**
      - `Themed.tsx`: Provides theme-aware `Text` and `View` components.
      - `Buttons.tsx`: Offers standardized `PrimaryButton`, `SecondaryButton`, `OutlinedButton`, `WarningButton`.
      - `Typography.tsx`: Collection of pre-styled text components (e.g., `LabelText`, `HeaderText`, `CardTitle`, `ErrorText`). `CardTitle` is the standard for all section headers within cards. It can be used with style overrides for alignment (e.g., `style={{ textAlign: 'left' }}`). `LabelText` now correctly uses themed text color.
      - `StyledText.tsx`: Provides `MonoText` for monospaced font rendering.
      - `Card.tsx`: (Moved from `components/common/`) Provides a theme-aware card container. Uses page background, theme-aware border (`StyleSheet.hairlineWidth`), and theme-aware shadow for distinction. Standardized padding (15) and marginBottom (15).
      - `Chip.tsx`: Displays small badge-like information (styling mostly hardcoded).
      - `CurrencyInput.tsx`: Non-themed currency input field with formatting.
      - `ExternalLink.tsx`: Handles opening external URLs in an in-app browser (native) or new tab (web).
      - `EditScreenInfo.tsx`: Helper component for development, shows file path information.
      - `useClientOnlyValue.ts/.web.ts`: Hooks for handling server/client value differences on web.
      - `useColorScheme.ts/.web.ts`: Hooks for accessing the current color scheme.
    - **Job-Specific UI (`components/job/`):**
      - `JobHeader.tsx`: Displays key job summary information (ID, ETA, status, address).
      - `CustomerInfo.tsx`: Shows read-only customer, car, and address details using themed `TextInput` fields.
      - `JobStatus.tsx`: Manages job lifecycle status changes with conditional buttons and modals.
      - `ArrivalTime.tsx`: Allows viewing and editing job ETA using platform-specific datetime pickers.
      - `JobLineItems.tsx` (as `JobLineItemsCard`): Manages CRUD operations for job services/line items, using a modal with `DropDownPicker` and `CurrencyInput`.
      - `Invoice.tsx` (as `InvoiceComponent`): Handles generation, display, and sending of invoices, using modals.
      - `TakePayment.tsx`: UI for initiating payment, allowing tip input, and launching payment modals.
      - `PaymentDialog.tsx`: Content for payment modals, currently focused on cash payments using `CashPaymentForm`.
      - `CashPaymentForm.tsx`: Simple confirmation UI for cash payments.
      - `JobDetailsAndMapButtons.tsx`: Displays customer info and integrates geocoding/map links.
      - `JobMapButtons.tsx`: Similar to part of `JobDetailsAndMapButtons`, focuses on map app launching. (Potential redundancy noted).
      - `CameraCaptureModal.tsx`: A modal component encapsulating `expo-camera` functionality for taking pictures. Handles camera permissions and returns captured image data.
      - `JobFiles.tsx`: Manages file uploads, viewing (images), and deletion for a job. Features separate icon buttons for camera capture (launching `CameraCaptureModal`) and file picking (using `expo-image-picker`).
    - **Invoice-Specific UI (`components/job/invoice/`):**
      - `CurrencyInput.tsx`: A themed version of currency input with formatting logic (potential redundancy with `components/CurrencyInput.tsx`).
    - **Common Patterns:**
      - Job-specific components in `components/job/` are self-contained cards, each wrapping its content in the `<Card>` component.
      - API interactions are common, typically followed by `fetchJob()` to refresh data.
      - Modals are used for forms (add line item, cancel job) and confirmations.
      - Extensive use of `useThemeColor` hooks for fine-grained theming of standard components.
3.  **Data Flow:**
    - Primarily through props (parent to child).
    - Global state (auth, user data) accessed via Context API.
    - Navigation parameters passed between screens using Expo Router.

## Critical Implementation Paths (Mobile App)

1.  **Authentication Flow:** Login, secure token storage, token refresh (if applicable), logout.
2.  **Go Online/Offline & Location Tracking:**
    - Requesting and handling location permissions.
    - Starting/stopping foreground and background location updates (`hooks/useLocation.ts`).
    - Transmitting location data to the backend API.
3.  **Job Management Cycle:**
    - Fetching and displaying assigned jobs.
    - Viewing job details (`app/job/[id].tsx`).
    - Updating job status and syncing with the backend.
    - Generating invoices and handling payment recording (cash, send invoice link).
    - Job file management, including photo uploads via camera and file picker.
4.  **Future Feature Implementations (requiring careful design):**
    - Real-time comments.
    - Cash management and deposits.
    - Video playback for uploaded job files.
