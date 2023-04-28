const { fontScale } = require('nativewind/dist/theme-functions');

module.exports = {
  content: ['App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontSize: {
        xxs: fontScale(10),
        xxl: fontScale(24),
      },
      colors: require('../../packages/shared/src/theme/colors').default,
    },
  },
  plugins: [],
};
