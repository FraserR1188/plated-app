const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Forces Metro to transform Supabase packages that use
// private class field syntax (#field) through Babel first
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
