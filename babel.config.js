module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated's plugin has to stay last.
    plugins: ['react-native-reanimated/plugin'],
  };
};
