module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["babel-plugin-relay", "tsconfig-paths-module-resolver"],
  };
};
