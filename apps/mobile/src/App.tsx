import 'expo-dev-client';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Suspense, useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RelayEnvironmentProvider } from 'react-relay';
import { SWRConfig } from 'swr';

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
            <MobileErrorReportingProvider>
              <SafeAreaProvider>
                <BottomSheetModalProvider>
                  <magic.Relayer />
                  <SearchProvider>
                    <NavigationContainer>
                      <DevMenuItems />
                      <RootStackNavigator />
                    </NavigationContainer>
                  </SearchProvider>
                </BottomSheetModalProvider>
              </SafeAreaProvider>
            </MobileErrorReportingProvider>
          </Suspense>
        </SWRConfig>
      </RelayEnvironmentProvider>
    </View>
  );
}
