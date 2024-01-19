/** @type {Detox.DetoxConfig} */
module.exports = {
  logger: {
    level: process.env.CI ? 'debug' : undefined,
  },
  testRunner: {
    $0: 'jest',
    args: {
      config: 'e2e/jest.config.js',
      _: ['e2e'],
    },
  },
  artifacts: {
    plugins: {
      log: process.env.CI ? 'failing' : undefined,
      screenshot: 'failing',
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      build:
        'xcodebuild -workspace ios/GalleryLabs.xcworkspace -scheme GalleryLabs -configuration Debug -sdk iphonesimulator -arch x86_64 -derivedDataPath ios/build',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/GalleryLabs.app',
    },
    'ios.release': {
      type: 'ios.app',
      build:
        'xcodebuild -workspace ios/GalleryLabs.xcworkspace -scheme GalleryLabs -configuration Release -sdk iphonesimulator -arch x86_64 -derivedDataPath ios/build',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/GalleryLabs.app',
    },
    'android.release': {
      type: 'android.apk',
      build:
        'cd android && ./gradlew :app:assembleRelease :app:assembleAndroidTest -DtestBuildType=release && cd ..',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15 Pro Max',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'pixel_4',
      },
    },
  },
  configurations: {
    'ios.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'ios.release': {
      device: 'simulator',
      app: 'ios.release',
    },
    'android.release': {
      device: 'emulator',
      app: 'android.release',
    },
  },
};
