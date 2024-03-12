import * as dotenv from 'dotenv';
import { ConfigContext, ExpoConfig } from 'expo/config';
import * as fs from 'fs';
import * as path from 'path';

import { EnvironmentSchema, SecretsSchema } from './env/env';

// TODO: fix zod return type later
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function readEnvironmentFromFile(file: string, schema: any) {
  const object = dotenv.parse(fs.readFileSync(file, 'utf-8'));

  const result = schema.safeParse(object);

  if (result.success === true) {
    return result.data;
  } else if (result.success === false) {
    throw new Error(`Could not validate your ${file}:\n\n${result.error.message}`);
  }
}

const environmentVariablePath = path.join(
  __dirname,
  `./env/.env.${process.env.EXPO_PUBLIC_ENV ?? 'prod'}`
);

let environmentVariables = readEnvironmentFromFile(environmentVariablePath, EnvironmentSchema);

const isCloudExpoBuildContext = process.env.USER === 'expo';
const isGithubBuildContext = 'GITHUB_JOB' in process.env;
const isLocalContext = !isCloudExpoBuildContext && !isGithubBuildContext;

if (isLocalContext) {
  const secretsPath = path.join(__dirname, `./env/.env.secret`);
  environmentVariables = {
    ...environmentVariables,
    ...readEnvironmentFromFile(secretsPath, SecretsSchema),
  };
}

const commitHash = process.env.EAS_BUILD_GIT_COMMIT_HASH;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

  name: 'Gallery Labs',
  slug: 'gallery-mobile',
  privacy: 'unlisted',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  version: '1.0.50',
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    config: {
      usesNonExemptEncryption: false,
    },
    associatedDomains: ['applinks:gallery.so', 'applinks:gallery-dev.vercel.app'],
    supportsTablet: false,
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
    commitHash,
  },
  owner: 'gallery',
  hooks: {
    postPublish: [
      {
        file: 'sentry-expo/upload-sourcemaps',
        config: {
          organization: 'usegallery',
          project: 'gallery-mobile',
          authToken: process.env.SENTRY_AUTH_TOKEN,
        },
      },
    ],
  },
  plugins: [['sentry-expo', { setCommits: true }], 'expo-barcode-scanner', 'expo-font', 'expo-secure-store'],
});
