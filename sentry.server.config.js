// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

const ENV = process.env.NEXT_PUBLIC_VERCEL_ENV;

const SENTRY_TRACING_SAMPLE_RATE = ENV === 'production' ? 0.05 : 1.0;

Sentry.init({
  // DSNs are safe to keep public because they only allow submission of
  // new events and related event data; they do not allow read access to
  // any information. While there is a risk of abusing a DSN, where any
  // user can send events to your organization with any information they
  // want, this is a rare occurrence.
  dsn: SENTRY_DSN || 'https://bd40a4affc1740e8b7516502389262fe@o1135798.ingest.sentry.io/6187637',
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: SENTRY_TRACING_SAMPLE_RATE,
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
  environment: ENV || 'local',
  // disable sentry reporting by default if in local development.
  // NEXT_PUBLIC_VERCEL_ENV is only set in a deployed environment.
  enabled: ENV !== undefined,
});
