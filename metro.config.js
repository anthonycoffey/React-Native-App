const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

module.exports = (async () => {
  // Get the default configuration
  const defaultConfig = await getDefaultConfig(__dirname);

  return {
    ...defaultConfig,  // Spread the default configuration
    resolver: {
      ...defaultConfig.resolver,  // Spread the default resolver settings
      alias: {
        '@': path.resolve(__dirname, './'),  // Map '@' to the root directory
      },
    },
  };
})();
