module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      'nativewind/babel',
      [
        'babel-plugin-relay',
        {
          artifactDirectory: './__generated__/relay',
        },
      ],
      'tsconfig-paths-module-resolver',
      ['@babel/plugin-proposal-private-methods', { loose: true }],
      'react-native-reanimated/plugin',
    ],
  };
};
