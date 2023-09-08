import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { XMarkIcon } from 'src/icons/XMarkIcon';

import { useManageWalletActions } from '~/contexts/ManageWalletContext';
import { UpsellBannerQuery } from '~/generated/UpsellBannerQuery.graphql';
import colors from '~/shared/theme/colors';

import { Button } from './Button';
import { GalleryTouchableOpacity } from './GalleryTouchableOpacity';
import { Typography } from './Typography';

export function UpsellBanner() {
  const query = useLazyLoadQuery<UpsellBannerQuery>(
    graphql`
      query UpsellBannerQuery {
        viewer {
          ... on Viewer {
            user {
              __typename
              primaryWallet {
                __typename
              }
            }
          }
        }
      }
    `,
    {}
  );

  const { top } = useSafeAreaInsets();

  const [isUpsellBannerDismissed, setIsUpsellBannerDismissed] = useState(false);

  const { openManageWallet } = useManageWalletActions();

  useEffect(() => {
    AsyncStorage.getItem('isUpsellBannerDismissed').then((value) => {
      if (value === 'true') {
        setIsUpsellBannerDismissed(true);
      }
    });
  }, []);

  const userHasWallet = query.viewer?.user?.primaryWallet?.__typename === 'Wallet' ?? false;

  const handleConnectWallet = useCallback(() => {
    openManageWallet({});
  }, [openManageWallet]);

  const handleDismissUpsellBanner = useCallback(() => {
    setIsUpsellBannerDismissed(true);
    AsyncStorage.setItem('isUpsellBannerDismissed', 'true');
  }, []);

  if (userHasWallet || isUpsellBannerDismissed) {
    return (
      <View
        style={{
          paddingTop: top,
        }}
        className="bg-white dark:bg-black-900"
      ></View>
    );
  }

  return (
    <View
      className="bg-activeBlue w-full px-4 py-2 flex-row items-center justify-between"
      style={{
        paddingTop: top,
      }}
    >
      <View>
        <Typography
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
          className="text-offWhite text-sm"
        >
          Gallery is better with a wallet
        </Typography>
        <Typography
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
          className="text-offWhite text-xs"
        >
          Add your wallet to start posting and curating
        </Typography>
      </View>
      <View className="flex-row items-center space-x-2">
        <Button
          onPress={handleConnectWallet}
          text="connect"
          size="xs"
          variant="secondary"
          fontWeight="Bold"
          eventElementId="Press Connect Wallet Upsell Banner"
          eventName="Press Connect Wallet Upsell Banner"
        />
        <GalleryTouchableOpacity
          className="p-2"
          eventElementId="Close Upsell Banner"
          eventName="Close Upsell Banner"
          onPress={handleDismissUpsellBanner}
        >
          <XMarkIcon color={colors.offWhite} />
        </GalleryTouchableOpacity>
      </View>
    </View>
  );
}
