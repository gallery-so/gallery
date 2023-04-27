const { fontScale } = require('nativewind/dist/theme-functions');

module.exports = {
  content: ['App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontSize: {
        xxs: fontScale(10),
        xxl: fontScale(24),
      },
      colors: {
        offWhite: '#F9F9F9',
        white: '#FEFEFE',
        offBlack: '#141414',
        black: '#000000',
        graphite: '#2F2F2F',
        shadow: '#707070',
        metal: '#9e9e9e',
        faint: '#f2f2f2',
        porcelain: '#e2e2e2',
        hyperBlue: '#001CC1',
        activeBlue: '#0022F0',
        error: '#FF6666',
        red: '#F00000',
      },
    },
  },
  plugins: [],
};
