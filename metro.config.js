const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Forces Metro to transform Supabase packages that use
// private class field syntax (#field) through Babel first
config.resolver.unstable_enablePackageExports = false;
const originalGetPolyfills = config.serializer.getPolyfills
  ? config.serializer.getPolyfills.bind(config.serializer)
  : () => [];

config.serializer.getPolyfills = (options) => [
  require.resolve("./src/polyfills/domException"),
  ...originalGetPolyfills(options),
];

module.exports = config;
