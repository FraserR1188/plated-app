require("./src/polyfills/domException");
require("react-native-url-polyfill/auto");

const registerRootComponent =
  require("expo/src/launch/registerRootComponent").default;
const App = require("./App").default;

registerRootComponent(App);
