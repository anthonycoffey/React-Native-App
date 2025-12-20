module.exports = ({ config }) => {
  return {
    ...config,
    android: {
      package: 'com.phoenix_mobile.app',
      ...config.android,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
    },
    ios: {
      bundleIdentifier: 'com.phoenix-mobile',
      ...config.ios,
      googleServicesFile: process.env.GOOGLE_SERVICES_PLIST,
      supportsTablet: true,
    },
  };
};