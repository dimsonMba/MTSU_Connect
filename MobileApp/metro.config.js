const { getDefaultConfig } = require("expo/metro-config");

// Using the default Expo Metro configuration. Removed Rork-specific wrapper
// because this project is running locally and does not use the @rork-ai toolkit.
const config = getDefaultConfig(__dirname);

module.exports = config;
