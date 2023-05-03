module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-typescript'],
  plugins: [
    [
      'relay',
      {
        artifactDirectory: './__generated__/relay',
      },
    ],
  ],
};
