module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react'],
  plugins: [
    [
      'relay',
      {
        artifactDirectory: './__generated__/relay',
      },
    ],
  ],
};
