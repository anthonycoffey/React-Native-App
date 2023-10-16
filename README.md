# Phoenix Mobile

Proudly powered by

![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)

![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

![Yarn](https://img.shields.io/badge/yarn-%232C8EBB.svg?style=for-the-badge&logo=yarn&logoColor=white)

[![runs with Expo Go](https://img.shields.io/badge/Runs%20with%20Expo%20Go-4630EB.svg?style=flat-square&logo=EXPO&labelColor=f3f3f3&logoColor=000)](https://expo.dev/client)

## NPM Scripts

`yarn start` - starts expo dev server, can pass `--android`, `--ios`, `--web` to build for single environment

`expo run:android` - test app outside of expo managed service on Android platform

`expo run:ios` - test app outside of expo managed service on iOS platform

`yarn ios` - starts local development build for iOS

`yarn android` - starts local development build for Android

`yarn test` - runs Jest unit tests

## .env config
`EXPO_PUBLIC_API_URL` - URL of Phoenix backend

`EXPO_PUBLIC_GEOCODING_API_KEY` - Google Maps API key

`EXPO_PUBLIC_AUTHORIZE_PUBLIC_KEY` - Authorize.net public key

`EXPO_PUBLIC_AUTHORIZE_LOGIN_ID` - Authorize.net login ID


### Troubleshooting Tips

- Windows Users: if Axios requests aren't working, use ngrok tunnel for `phoenix` backend API because there may be networking issues without it.

- Sometimes issues can be caused by cache, to clear cache with expo: `yarn start --clear`

- An .env file is required with a single property `API_URL` that points to Phoenix backend 

- Sometimes issues can be caused by cache, to clear cache with expo running the following command `yarn start --clear`
  
    Note: Refer to Expo documentation on clearing cache for your development environment:

    https://docs.expo.dev/troubleshooting/clear-cache-macos-linux/

    https://docs.expo.dev/troubleshooting/clear-cache-windows/

- **ANDROID**: For local development builds to work you need JDK 11 installed and `JAVA_HOME` environment variable set to JDK 11 path
- **IOS**: For local development builds to work you need XCode installed
