module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel",
      "babel-plugin-relay",
      "tsconfig-paths-module-resolver",
    ],
  };
};
