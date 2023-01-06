// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { Breadcrumbs, Dedupe, HttpContext, LinkedErrors } from '@sentry/browser';
import { Integrations as CoreIntegrations } from '@sentry/core';
import * as Sentry from '@sentry/nextjs';

import { ErrorWithSentryMetadata } from './src/errors/ErrorWithSentryMetadata';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

const ENV = process.env.NEXT_PUBLIC_VERCEL_ENV;

const IS_PROD = ENV === 'production';

const SENTRY_TRACING_ORIGIN = IS_PROD ? 'api.gallery.so' : 'api.dev.gallery.so';

const SENTRY_TRACING_SAMPLE_RATE = IS_PROD ? 0.05 : 1.0;

Sentry.init({
  defaultIntegrations: false,
  integrations: [
    // Defaults from Sentry
    // https://sourcegraph.com/github.com/getsentry/sentry-javascript@36488ec3ef5394c97dcf3c3ef25c09bab266e5ea/-/blob/packages/browser/src/sdk.ts?L23
    new CoreIntegrations.InboundFilters(),
    new CoreIntegrations.FunctionToString(),
    new Breadcrumbs(),
    new LinkedErrors(),
    new Dedupe(),
    new HttpContext(),

    // The defaults include these two but we want to disable them to ensure
    // that errors thrown during a render don't get double reported
    // new TryCatch(),
    // new GlobalHandlers(),

    // This gives us extra metadata about HTTP requests, page navigation, etc.
    new Sentry.BrowserTracing({
      tracingOrigins: [SENTRY_TRACING_ORIGIN, 'localhost'],
    }),
  ],

  ignoreErrors: [
    // Ignore Metamask rejected errors
    'UserRejectedRequestError',
  ],

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
  tunnel: 'https://monitoring.gallery.so/bugs',
  // disable sentry reporting by default if in local development.
  // NEXT_PUBLIC_VERCEL_ENV is only set in a deployed environment.
  enabled: ENV !== undefined,
});

Sentry.configureScope((scope) => {
  scope.addEventProcessor((event, hint) => {
    if (hint.originalException instanceof ErrorWithSentryMetadata) {
      Object.assign(event.tags, hint.originalException.metadata);
    }

    return event;
  });
});
