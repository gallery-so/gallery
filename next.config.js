module.exports = {
  typescript: {
    // If we ever move to github actions, we can turn this on
    // to parallelize CI. Vercel can do a build while we are
    // typechecking to save time.
    ignoreBuildErrors: false,
  },

  target: 'serverless',
  async rewrites() {
    return [
      // Rewrite everything to `pages/index`
      {
        source: '/:any*',
        destination: '/',
      },
    ];
  },
};
