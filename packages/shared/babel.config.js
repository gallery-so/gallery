module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [
    [
      'relay',
      {
        artifactDirectory: './__generated__/relay',
      },
    ],
  ],
};
