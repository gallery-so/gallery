const relayConfig = require('./relay.config');

/**
 * @type {import('next').NextConfig}
 **/
module.exports = {
  typescript: {
    // If we ever move to github actions, we can turn this on
    // to parallelize CI. Vercel can do a build while we are
    // typechecking to save time.
    ignoreBuildErrors: false,
  },

  target: 'serverless',

  // webpack(config) {
  //   config.module.rules.push({
  //     test: /\.svg$/,
  //     use: ['@svgr/webpack'],
  //   });

  //   return config;
  // },

  experimental: {
    // Enables the styled-components SWC transform
    styledComponents: true,
    scrollRestoration: true,
    relay: relayConfig,
    // React 18 features
    concurrentFeatures: true,
    serverComponents: true,
  },
};
