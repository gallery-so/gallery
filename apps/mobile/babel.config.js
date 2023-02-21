module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "babel-plugin-relay",
        {
          artifactDirectory: "./__generated__/relay",
        },
      ],
      "tsconfig-paths-module-resolver",
    ],
  };
};
