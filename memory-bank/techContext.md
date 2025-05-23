# Tech Context

This document details the technologies used, development setup, technical constraints, dependencies, and tool usage patterns.

## Technologies Used

- **Framework:** Expo (latest SDK, React v19)
- **Language:** TypeScript
- **Core Library:** React Native
- **Navigation:** Expo Router (File System Based)
- **State Management:** React Context API
- **Secure Storage:** `expo-secure-store`
- **Camera Access:** `expo-camera` (for direct camera interaction)
- **Document Picking:** `expo-document-picker` (for selecting files from storage)
- **Background Task Management:** `expo-task-manager` (used for background location updates)
- **Package Manager:** NPM (officially recommended by Expo for this project)
- **Build & Deployment:** EAS Build, EAS Update
- **Testing:** Jest (implied by `npm test` script)
- **Cryptography:** `expo-crypto` (used for generating UUIDs for Google Places API session tokens)

## Development Setup

1.  **Node.js:** Specific version not stated, assume latest LTS compatible with Expo SDK.
2.  **Package Manager:** `npm` is officially recommended and used.
3.  **Running Locally:**
    *   `npm start`: Starts Expo development server. Can pass `--android`, `--ios`, `--web` flags.
    *   `npm run ios`: Starts local development build for iOS.
    *   `npm run android`: Starts local development build for Android.
    *   `expo run:android` / `expo run:ios`: Test app outside of Expo managed service.
4.  **Environment Configuration (`.env` file):**
    *   `EXPO_PUBLIC_API_URL`: URL of the Phoenix backend API.
    *   `EXPO_PUBLIC_GEOCODING_API_KEY`: Google Maps API key for geocoding.
5.  **Platform Specific Setup:**
    *   **Android Local Builds:** Requires JDK 11 installed and `JAVA_HOME` environment variable set to JDK 11 path.
    *   **iOS Local Builds:** Requires XCode installed.
    *   **iOS Simulator Builds:**
        *   `npm run build:simulator`: Creates a new simulator build (needed for `eas.json` changes).
        *   `npm run build:run`: Installs a simulator build.
6.  **IDE:** VS Code is commonly used, though not explicitly mandated. Standard ESLint setup (`.eslintrc.js`) is present.

## Technical Constraints

1.  **API Connectivity (Windows):** Windows users might require `ngrok` or a similar tunneling service for the Phoenix backend API during local development due to potential networking issues with Axios.
2.  **Build Dependencies:**
    *   Android: JDK 11.
    *   iOS: XCode.
3.  **Cache Issues:** Expo and Metro bundler cache can sometimes cause unexpected issues. Clearing cache is a common troubleshooting step (`npm start -- --clear`, or manual deletion of `node_modules`, `ios`, `android` folders and cache directories).
4.  **EAS Configuration:** The `eas.json` file (not checked into git) is crucial for EAS builds and contains environment-specific configurations.

## Dependencies

- Refer to `package.json` for a full list of dependencies.
  - `expo-camera`: Provides access to the device camera for capturing photos/videos. Its plugin is used in `app.json` to manage native permissions and usage descriptions.
  - `expo-crypto`: Provides cryptographic functionalities, including UUID generation for Google Places API session tokens.
  - `expo-document-picker`: Allows users to select documents or files from the device's storage.
  - `expo-task-manager`: Enables defining and managing tasks that can run in the background, such as location tracking.

## Tool Usage Patterns

1.  **Expo Router:**
    *   Screens are organized in the `app/` directory following file system routing conventions.
    *   Layouts (`_layout.tsx`) are used for shared UI and route protection.
2.  **EAS (Expo Application Services):**
    *   `eas update --channel <channel_name> --message "..."`: Used for publishing over-the-air updates.
    *   EAS Build is used for creating development and production builds (configured via `eas.json`).
3.  **NPM Scripts:** Key scripts defined in `package.json` (e.g., `start`, `ios`, `android`, `test`, `build:simulator`, `build:run`).
4.  **Linting & Formatting:** ESLint is configured (`.eslintrc.js`). Adherence to linting rules is expected.
5.  **Debugging:**
    *   Standard React Native/Expo debugging tools.
    *   Clearing cache (`npm start -- --clear`, manual cache cleaning steps provided in README).
    *   Using `ngrok` for API issues on Windows.
6.  **Self-Signed Bundles (Android):** `bundletool.jar` and `jarsigner` are used for creating and signing `.apks` files from `.aab` bundles for specific distribution needs.
