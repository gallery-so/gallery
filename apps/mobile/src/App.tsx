import 'expo-dev-client';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Suspense, useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RelayEnvironmentProvider } from 'react-relay';
import { SWRConfig } from 'swr';

import { NotificationRegistrar } from '~/components/Notification/NotificationRegistrar';
import { MobileAnalyticsProvider } from '~/contexts/MobileAnalyticsProvider';
import { MobileErrorReportingProvider } from '~/contexts/MobileErrorReportingProvider';
import { createRelayEnvironment } from '~/contexts/relay/RelayProvider';
import { RootStackNavigator } from '~/navigation/RootStackNavigator';

import { DevMenuItems } from './components/DevMenuItems';
import { LoadingView } from './components/LoadingView';
import SearchProvider from './components/Search/SearchContext';
import { magic } from './magic';

SplashScreen.preventAutoHideAsync();

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

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
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
                        <BottomSheetModalProvider>
                          {/* Register the user's push token if one exists (does not prompt the user) */}
                          <NotificationRegistrar />
                          <DevMenuItems />
                          <RootStackNavigator navigationContainerRef={navigationRef} />
                        </BottomSheetModalProvider>
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
