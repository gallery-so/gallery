const { withSentryConfig } = require('@sentry/nextjs');
const withRoutes = require('nextjs-routes/config')();
const withBundleAnalyzer = require('@next/bundle-analyzer');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Save time in Vercel builds by avoiding a type check.
    // This is fine since we do a type check in Github Actions.
    ignoreBuildErrors: true,
  },
  headers() {
    return [
      {
        source: '/.well-known/apple-app-site-association',
        headers: [{ key: 'content-type', value: 'application/json' }],
      },
    ];
  },
  eslint: {
    // Save time in Vercel builds by avoiding linting.
    // This is fine since we do a lint in Github Actions.
    ignoreDuringBuilds: true,
  },

  /** @type {import('@sentry/nextjs/types/config/types').UserSentryOptions} */
  sentry: {
    // Use `hidden-source-map` rather than `source-map` as the Webpack `devtool`
    // for client-side builds. (This will be the default starting in
    // `@sentry/nextjs` version 8.0.0.) See
    // https://webpack.js.org/configuration/devtool/ and
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#use-hidden-source-map
    // for more information.
    hideSourceMaps: true,
  },

  webpack(config) {
    // Start https://github.com/NiGhTTraX/ts-monorepo/blob/master/apps/nextjs/next.config.js#L3
    // Allows us to use typescript from other directories
    const oneOfRule = config.module.rules.find((rule) => rule.oneOf);

    // Next 12 has multiple TS loaders, and we need to update all of them.
    const tsRules = oneOfRule.oneOf.filter(
      (rule) => rule.test && rule.test.toString().includes('tsx|ts')
    );

    tsRules.forEach((rule) => {
      // eslint-disable-next-line no-param-reassign
      rule.include = undefined;
    });
    // End https://github.com/NiGhTTraX/ts-monorepo/blob/master/apps/nextjs/next.config.js#L3

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
    relay: {
      src: './',
      language: 'typescript',
      artifactDirectory: './__generated__/relay',
    },
    styledComponents: true,
  },

  images: {
    domains: ['storage.googleapis.com'],
  },

  // Disabled until we figure out what's going on with ERRCONNRESET
  // async rewrites() {
  //   return [
  //     {
  //       source: '/glry/:path*',
  //       destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/glry/:path*`,
  //     },
  //   ];
  // },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: false,
      },
      {
        source: '/trending',
        destination: '/home',
        permanent: false,
      },
      {
        source: '/activity',
        destination: '/home',
        permanent: false,
      },
      {
        source: '/featured',
        destination: '/explore',
        permanent: false,
      },
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

/** @type {Partial<import('@sentry/nextjs/types/config/types').SentryWebpackPluginOptions>} */
const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true,
  authToken: process.env.NEXT_PUBLIC_SENTRY_AUTH_TOKEN,

  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

const plugins = [
  withRoutes,
  withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
  }),
];

if (process.env.DISABLE_SENTRY !== 'true') {
  plugins.push((config) => withSentryConfig(config, sentryWebpackPluginOptions));
}

module.exports = plugins.reduce((config, plugin) => plugin(config), nextConfig);
