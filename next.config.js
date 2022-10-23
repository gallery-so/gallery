const relayConfig = require('./relay.config');
const { withSentryConfig } = require('@sentry/nextjs');
const withRoutes = require('nextjs-routes/config')();

const nextConfig = {
  typescript: {
    // Save time in Vercel builds by avoiding a type check.
    // This is fine since we do a type check in Github Actions.
    ignoreBuildErrors: true,
  },

  eslint: {
    // Save time in Vercel builds by avoiding linting.
    // This is fine since we do a lint in Github Actions.
    ignoreDuringBuilds: true,
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  experimental: {
    // Enables the styled-components SWC transform
    scrollRestoration: true,
  },
  compiler: {
    relay: relayConfig,
    styledComponents: true,
  },

  async redirects() {
    return [
      {
        source: '/careers',
        destination: 'https://gallery-so.notion.site/Careers-e8d78dea54834630928f075f4a4ccdba',
        permanent: false,
      },
      process.env.MAINTENANCE_MODE === '1'
        ? // Redirect all non-maintenance routes to /maintenance.
          // Also ignore /icons so that assets properly load on that page.
          { source: '/((?!maintenance|icons).*)', destination: '/maintenance', permanent: false }
        : null,
    ].filter(Boolean);
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

const plugins = [withRoutes, (config) => withSentryConfig(config, sentryWebpackPluginOptions)];

module.exports = (_phase, { defaultConfig }) =>
  plugins.reduce((acc, plugin) => plugin(acc), { ...defaultConfig, ...nextConfig });
