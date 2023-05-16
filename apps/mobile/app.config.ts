import * as dotenv from 'dotenv';
import { ConfigContext, ExpoConfig } from 'expo/config';
import * as fs from 'fs';

import { EnvironmentSchema } from './env/env';

function readEnvironmentFromFile(file: string) {
  const object = dotenv.parse(fs.readFileSync(file, 'utf-8'));

  const result = EnvironmentSchema.safeParse(object);

  if (result.success === true) {
    return result.data;
  } else if (result.success === false) {
    throw new Error(`Could not validate your ${file}:\n\n${result.error.message}`);
  }
}

const environmentVariablePath = `./env/.env.${process.env.ENV ?? 'prod'}`;
// eslint-disable-next-line no-console
console.log(`Loading Environment Variables from: ${environmentVariablePath}`);
const environmentVariables = readEnvironmentFromFile(environmentVariablePath);

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

  name: 'gallery.so',
  slug: 'gallery-mobile',
  privacy: 'unlisted',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',

  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    config: {
      usesNonExemptEncryption: false,
    },
    supportsTablet: true,
    bundleIdentifier: 'com.usegallery.gallery',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
      dark: {
        backgroundColor: '#000000',
        image: './assets/splash-dark.png',
      },
    },
  },
  android: {
    blockedPermissions: ['android.permission.RECORD_AUDIO'],
    package: 'com.usegallery.gallery',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
      dark: {
        backgroundColor: '#000000',
        image: './assets/splash-dark.png',
      },
    },
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    eas: {
      projectId: '67c952bc-7ade-408c-a95d-72c36ce9252c',
    },
    ...environmentVariables,
  },
  owner: 'gallery',
  hooks: {
    postPublish: [
      {
        file: 'sentry-expo/upload-sourcemaps',
        config: {
          organization: 'usegallery',
          project: 'gallery-mobile',
          authToken: 'b2ea4a67f0ed4409968c4725d550df82d5187c12908d441cbf4a43da145934b1',
        },
      },
    ],
  },
  plugins: [
    // EAS_BUILD_GIT_COMMIT_HASH is provided by Expo https://docs.expo.dev/build-reference/variables/#built-in-environment-variables
    ['sentry-expo', { setCommits: true, release: process.env.EAS_BUILD_GIT_COMMIT_HASH }],
    'expo-barcode-scanner',
  ],
});
