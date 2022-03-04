const relayConfig = require('./relay.config');
const { withSentryConfig } = require('@sentry/nextjs');

const moduleExports = {
  typescript: {
    // If we ever move to github actions, we can turn this on
    // to parallelize CI. Vercel can do a build while we are
    // typechecking to save time.
    ignoreBuildErrors: false,
  },

  target: 'serverless',

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  experimental: {
    // Enables the styled-components SWC transform
    styledComponents: true,
    scrollRestoration: true,
    relay: relayConfig,
  },
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  authToken: process.env.NEXT_PUBLIC_SENTRY_AUTH_TOKEN,
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
