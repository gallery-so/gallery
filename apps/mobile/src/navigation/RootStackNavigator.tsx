import {
  NavigationContainerRefWithCurrent,
  NavigationProp,
  RouteProp,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Suspense, useEffect } from 'react';
import { View } from 'react-native';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import isFeatureEnabled, { FeatureFlag } from 'src/utils/isFeatureEnabled';

import { UpsellBanner } from '~/components/UpsellBanner';
import { RootStackNavigatorFragment$key } from '~/generated/RootStackNavigatorFragment.graphql';
import { RootStackNavigatorQuery } from '~/generated/RootStackNavigatorQuery.graphql';
import { LoginStackNavigator } from '~/navigation/LoginStackNavigator';
import { MainTabNavigator } from '~/navigation/MainTabNavigator/MainTabNavigator';
import { RootStackNavigatorParamList } from '~/navigation/types';
import { Debugger } from '~/screens/Debugger';
import { DesignSystemButtonsScreen } from '~/screens/DesignSystemButtonsScreen';
import { TwitterSuggestionListScreen } from '~/screens/HomeScreen/TwitterSuggestionListScreen';
import { UserSuggestionListScreen } from '~/screens/HomeScreen/UserSuggestionListScreen';
import { NftSelectorContractScreen } from '~/screens/NftSelectorScreen/NftSelectorContractScreen';
import { NftSelectorPickerScreen } from '~/screens/NftSelectorScreen/NftSelectorPickerScreen';
import { PostComposerScreen } from '~/screens/PostScreen/PostComposerScreen';
import { ProfileQRCodeScreen } from '~/screens/ProfileQRCodeScreen';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
const Stack = createNativeStackNavigator<RootStackNavigatorParamList>();

type Props = {
  navigationContainerRef: NavigationContainerRefWithCurrent<ReactNavigation.RootParamList>;
};

export function RootStackNavigator({ navigationContainerRef }: Props) {
  const query = useLazyLoadQuery<RootStackNavigatorQuery>(
    graphql`
      query RootStackNavigatorQuery {
        viewer {
          ... on Viewer {
            __typename
          }
        }
        ...isFeatureEnabledFragment
        ...RootStackNavigatorFragment
      }
    `,
    {}
  );

  const track = useTrack();
  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  useEffect(() => {
    const unsubscribe = navigationContainerRef.addListener('state', () => {
      track('Page View', {
        page: navigationContainerRef.getCurrentRoute()?.name,
        params: navigationContainerRef.getCurrentRoute()?.params,
      });
    });

    return unsubscribe;
  }, [navigationContainerRef, track]);

  return (
    <Stack.Navigator
      screenOptions={{ header: Empty }}
      initialRouteName={isLoggedIn ? 'MainTabs' : 'Login'}
    >
      <Stack.Screen name="Login" component={LoginStackNavigator} />

      <Stack.Screen name="PostNftSelector" component={NftSelectorPickerScreen} />
      <Stack.Screen name="NftSelectorContractScreen" component={NftSelectorContractScreen} />
      <Stack.Screen name="PostComposer" component={PostComposerScreen} />

      <Stack.Screen name="MainTabs">
        {(props) => <MainScreen {...props} queryRef={query} />}
      </Stack.Screen>

      <Stack.Screen
        name="ProfileQRCode"
        options={{ presentation: 'modal' }}
        component={ProfileQRCodeScreen}
      />
      <Stack.Screen
        name="UserSuggestionList"
        options={{
          presentation: 'modal',
        }}
        component={UserSuggestionListScreen}
      />
      <Stack.Screen
        name="TwitterSuggestionList"
        options={{
          presentation: 'modal',
        }}
        component={TwitterSuggestionListScreen}
      />
      <Stack.Screen name="DesignSystemButtons" component={DesignSystemButtonsScreen} />
      <Stack.Screen name="Debugger" component={Debugger} />
    </Stack.Navigator>
  );
}

function Empty() {
  return null;
}

type MainScreenProps = {
  queryRef: RootStackNavigatorFragment$key;
  route: RouteProp<RootStackNavigatorParamList, 'MainTabs'>;
  navigation: NavigationProp<RootStackNavigatorParamList, 'MainTabs'>;
};

function MainScreen({ queryRef, ...props }: MainScreenProps) {
  const query = useFragment(
    graphql`
      fragment RootStackNavigatorFragment on Query {
        ...isFeatureEnabledFragment
        ...UpsellBannerFragment
      }
    `,
    queryRef
  );

  const isKoalaEnabled = isFeatureEnabled(FeatureFlag.KOALA, query);

  return (
    <View className="flex-1">
      <Suspense fallback={<View />}>
        <UpsellBanner queryRef={query} />
      </Suspense>
      <MainTabNavigator isKoalaEnabled={isKoalaEnabled} {...props} />
    </View>
  );
}
