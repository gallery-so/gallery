import synpressPlugins from '@synthetixio/synpress/plugins';
import { defineConfig } from 'cypress';

export default defineConfig({
  userAgent: 'synpress',
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  chromeWebSecurity: true,
  viewportWidth: 1920,
  viewportHeight: 1080,
  env: {
    NETWORK_NAME: 'mainnet',
  },
  defaultCommandTimeout: 30000,
  pageLoadTimeout: 30000,
  requestTimeout: 30000,
  projectId: 'igfgns',
  e2e: {
    testIsolation: true,
    setupNodeEvents(on, config) {
      synpressPlugins(on, config);
    },
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/integration/specs/**/*.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
  },
});
