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

`yarn test` - runs Jest unit tests




### Troubleshooting Tips

- Windows Users: if Axios requests aren't working, use ngrok tunnel for `phoenix` backend API because there may be networking issues without it.

- Sometimes issues can be caused by cache, to clear cache with expo: `yarn start --clear`

- An .env file is required with a single property `API_URL` that points to Phoenix backend 

- Auth.net is dependent on .env file

- Google Maps Geocoding is dependent on .env file