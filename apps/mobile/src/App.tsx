import 'expo-dev-client';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { addBreadcrumb } from '@sentry/react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'nativewind';
import { Suspense, useEffect, useState } from 'react';
import { Appearance, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RelayEnvironmentProvider } from 'react-relay';
import { SWRConfig } from 'swr';

import { DeepLinkRegistrar } from '~/components/DeepLinkRegistrar';
import { NotificationRegistrar } from '~/components/Notification/NotificationRegistrar';
import { MobileAnalyticsProvider } from '~/contexts/MobileAnalyticsProvider';
import { MobileErrorReportingProvider } from '~/contexts/MobileErrorReportingProvider';
import { createRelayEnvironment } from '~/contexts/relay/RelayProvider';
import { RootStackNavigator } from '~/navigation/RootStackNavigator';

import { DevMenuItems } from './components/DevMenuItems';
import { LoadingView } from './components/LoadingView';
import SearchProvider from './components/Search/SearchContext';
import { Typography } from './components/Typography';
import ManageWalletProvider from './contexts/ManageWalletContext';
import SyncTokensProvider from './contexts/SyncTokensContext';
import ToastProvider from './contexts/ToastContext';
import { TokenStateManagerProvider } from './contexts/TokenStateManagerContext';
import { magic } from './magic';
import { useCacheIntroVideo } from './screens/Onboarding/useCacheIntroVideo';
import { fetchSanityContent } from './utils/sanity';

SplashScreen.preventAutoHideAsync();

type SanityMaintenanceModeResponse = {
  isActive: boolean;
  message: string;
};

export default function App() {
  const [relayEnvironment] = useState(() => createRelayEnvironment());

  const [fontsLoaded] = useFonts({
    GTAlpinaStandardLight: require('~/shared/fonts/GT-Alpina-Standard-Light.ttf'),
    GTAlpinaStandardLightItalic: require('~/shared/fonts/GT-Alpina-Standard-Light-Italic.ttf'),

    GTAlpinaMedium: require('~/shared/fonts/GT-Alpina-Condensed-Medium.ttf'),
    GTAlpinaMediumItalic: require('~/shared/fonts/GT-Alpina-Condensed-Medium-Italic.ttf'),

    GTAlpinaLight: require('~/shared/fonts/GT-Alpina-Condensed-Light.ttf'),
    GTAlpinaLightItalic: require('~/shared/fonts/GT-Alpina-Condensed-Light-Italic.ttf'),

    GTAlpinaBold: require('~/shared/fonts/GT-Alpina-Condensed-Bold-Italic.ttf'),
    GTAlpinaBoldItalic: require('~/shared/fonts/GT-Alpina-Condensed-Bold-Italic.ttf'),

    ABCDiatypeMono: require('~/shared/fonts/ABCDiatypeMono-Medium.ttf'),
    ABCDiatypeRegular: require('~/shared/fonts/ABCDiatype-Regular.ttf'),
    ABCDiatypeMedium: require('~/shared/fonts/ABCDiatype-Medium.ttf'),
    ABCDiatypeBold: require('~/shared/fonts/ABCDiatype-Bold.ttf'),
  });

  const navigationRef = useNavigationContainerRef();

  const [colorSchemeLoaded, setColorSchemeLoaded] = useState(false);
  const [sanityLoadedOrError, setSanityLoadedOrError] = useState(false);
  const [sanityMaintenanceModeResponse, setSanityMaintenanceModeResponse] =
    useState<SanityMaintenanceModeResponse | null>(null);
  const { setColorScheme, colorScheme } = useColorScheme();
  const { introVideoLoaded } = useCacheIntroVideo();

  useEffect(
    function loadInitialColorSchemeFromAsyncStorage() {
      Promise.all([Appearance.getColorScheme(), AsyncStorage.getItem('colorScheme')])
        .then(([systemColorScheme, storedColorScheme]) => {
          const colorScheme = storedColorScheme ?? systemColorScheme ?? 'light';

          addBreadcrumb({
            category: 'theme',
            message: `Loaded initial color scheme: ${colorScheme}`,
          });

          setColorScheme(colorScheme as 'light' | 'dark');

          setColorSchemeLoaded(true);
        })
        .catch((error) => {
          reportError(error);

          setColorScheme('light');
          setColorSchemeLoaded(true);
        });
    },
    [setColorScheme]
  );

  useEffect(
    function saveUsersColorSchemeToAsyncStorage() {
      if (colorSchemeLoaded) {
        addBreadcrumb({
          category: 'theme',
          message: `Saving color scheme to async storage: ${colorScheme}`,
        });

        AsyncStorage.setItem('colorScheme', colorScheme)
          .then(() => {
            addBreadcrumb({
              category: 'theme',
              message: `Saved color scheme to async storage: ${colorScheme}`,
            });
          })
          .catch((error) => {
            reportError(error);
          });
      }
    },
    [colorScheme, colorSchemeLoaded]
  );

  useEffect(() => {
    const fetchMaintenanceModeFromSanity = async () => {
      try {
        const response = await Promise.race([
          fetchSanityContent('*[_type == "maintenanceMode"][0] { isActive, message }'),
          new Promise(
            (_, reject) =>
              setTimeout(() => reject(new Error('Request timed out after 3 seconds')), 3000) // give Sanity 3 seconds max to respond so we don't block the app from loading if Sanity is down
          ),
        ]);
        setSanityMaintenanceModeResponse(response);
      } finally {
        // the app is ready to be shown in these 3 cases: Sanity responded with a valid response, Sanity responded with an error, or Sanity timed out
        setSanityLoadedOrError(true);
      }
    };

    fetchMaintenanceModeFromSanity();
  }, []);

  useEffect(
    function markTheAppAsReadyWhenTheFontsAndColorSchemeHaveLoaded() {
      if (fontsLoaded && colorSchemeLoaded && sanityLoadedOrError) {
        SplashScreen.hideAsync();
      }
    },
    [colorSchemeLoaded, fontsLoaded, sanityLoadedOrError]
  );

  if (!fontsLoaded || !colorSchemeLoaded || !sanityLoadedOrError || !introVideoLoaded) {
    return null;
  }

  if (sanityMaintenanceModeResponse) {
    return (
      <View className="flex-1 bg-white dark:bg-black-900 flex justify-center items-center m-3">
        <Typography className="text-l mb-1" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          Maintenance in Progress
        </Typography>
        <Typography
          className="text-l text-center leading-6"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          {sanityMaintenanceModeResponse.message}
        </Typography>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black-900">
      <RelayEnvironmentProvider environment={relayEnvironment}>
        <SWRConfig>
          <Suspense fallback={<LoadingView />}>
            <MobileAnalyticsProvider>
              <MobileErrorReportingProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <SafeAreaProvider>
                    <magic.Relayer />
                    <SearchProvider>
                      <NavigationContainer ref={navigationRef}>
                        <ToastProvider>
                          <TokenStateManagerProvider>
                            <BottomSheetModalProvider>
                              <SyncTokensProvider>
                                <ManageWalletProvider>
                                  {/* Register the user's push token if one exists (does not prompt the user) */}
                                  <NotificationRegistrar />
                                  <DevMenuItems />
                                  <DeepLinkRegistrar />
                                  <RootStackNavigator navigationContainerRef={navigationRef} />
                                </ManageWalletProvider>
                              </SyncTokensProvider>
                            </BottomSheetModalProvider>
                          </TokenStateManagerProvider>
                        </ToastProvider>
                      </NavigationContainer>
                    </SearchProvider>
                  </SafeAreaProvider>
                </GestureHandlerRootView>
              </MobileErrorReportingProvider>
            </MobileAnalyticsProvider>
          </Suspense>
        </SWRConfig>
      </RelayEnvironmentProvider>
    </View>
  );
}
