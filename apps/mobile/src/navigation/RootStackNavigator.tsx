import { PortalHost } from '@gorhom/portal';
import { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Suspense, useEffect } from 'react';
import { View } from 'react-native';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import { useMaintenanceContext } from 'shared/contexts/MaintenanceStatusContext';

import { ClaimMintUpsellBanner } from '~/components/ClaimMintUpsellBanner';
import { ConnectWalletUpsellBanner } from '~/components/ConnectWalletUpsellBanner';
import { MaintenanceNoticeBottomSheetWrapper } from '~/components/MaintenanceScreen';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { RootStackNavigatorFragment$key } from '~/generated/RootStackNavigatorFragment.graphql';
import { RootStackNavigatorQuery } from '~/generated/RootStackNavigatorQuery.graphql';
import { LoginStackNavigator } from '~/navigation/LoginStackNavigator';
import { MainTabNavigator } from '~/navigation/MainTabNavigator/MainTabNavigator';
import { RootStackNavigatorParamList } from '~/navigation/types';
import { Debugger } from '~/screens/Debugger';
import { DesignSystemButtonsScreen } from '~/screens/DesignSystemButtonsScreen';
import { TwitterSuggestionListScreen } from '~/screens/HomeScreen/TwitterSuggestionListScreen';
import { UserSuggestionListScreen } from '~/screens/HomeScreen/UserSuggestionListScreen';
import { PostComposerScreen } from '~/screens/PostScreen/PostComposerScreen';
import { PostNftSelectorContractScreen } from '~/screens/PostScreen/PostNftSelectorContractScreen';
import { PostNftSelectorScreen } from '~/screens/PostScreen/PostNftSelectorScreen';
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
        ...RootStackNavigatorFragment
      }
    `,
    {}
  );

  const track = useTrack();
  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  const { upcomingMaintenanceNoticeContent } = useMaintenanceContext();

  useEffect(() => {
    const unsubscribe = navigationContainerRef.addListener('state', () => {
      track('Page View', {
        page: navigationContainerRef.getCurrentRoute()?.name,
        params: navigationContainerRef.getCurrentRoute()?.params,
      });
    });

    return unsubscribe;
  }, [navigationContainerRef, track]);

  const { hideBottomSheetModal } = useBottomSheetModalActions();

  return (
    <>
      {upcomingMaintenanceNoticeContent?.isActive && (
        <MaintenanceNoticeBottomSheetWrapper noticeContent={upcomingMaintenanceNoticeContent} />
      )}
      <Stack.Navigator
        screenOptions={{ header: Empty }}
        initialRouteName={isLoggedIn ? 'MainTabs' : 'Login'}
        screenListeners={{
          state: (e) => {
            // Do something with the state
            // if (isBottomSheetModalVisible) {
            hideBottomSheetModal();
            // }
            console.log('state changed', e.data);
          },
        }}
      >
        <Stack.Screen name="Login" component={LoginStackNavigator} />

        <Stack.Screen name="PostNftSelector" component={PostNftSelectorScreen} />
        <Stack.Screen name="NftSelectorContractScreen" component={PostNftSelectorContractScreen} />
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
      <View className="flex border border-red">
        <PortalHost name="bottomSheetPortal" />
      </View>
    </>
  );
}

function Empty() {
  return null;
}

type MainScreenProps = {
  queryRef: RootStackNavigatorFragment$key;
};

function MainScreen({ queryRef }: MainScreenProps) {
  const query = useFragment(
    graphql`
      fragment RootStackNavigatorFragment on Query {
        ...ConnectWalletUpsellBannerFragment
        ...ClaimMintUpsellBannerFragment
      }
    `,
    queryRef
  );

  return (
    <View className="flex-1">
      <Suspense fallback={<View />}>
        <ConnectWalletUpsellBanner queryRef={query} />
        <ClaimMintUpsellBanner queryRef={query} />
      </Suspense>
      <MainTabNavigator />
    </View>
  );
}
