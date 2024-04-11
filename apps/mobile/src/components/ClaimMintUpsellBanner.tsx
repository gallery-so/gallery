import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { MCHX_CLAIM_CODE_KEY } from 'src/constants/storageKeys';
import usePersistedState from 'src/hooks/usePersistedState';
import { XMarkIcon } from 'src/icons/XMarkIcon';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { ClaimMintUpsellBannerFragment$key } from '~/generated/ClaimMintUpsellBannerFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';

import { Button } from './Button';
import { GalleryTouchableOpacity } from './GalleryTouchableOpacity';
import MintCampaignBottomSheet from './Mint/MintCampaign/MintCampaignBottomSheet';
import { Typography } from './Typography';

type Props = {
  queryRef: ClaimMintUpsellBannerFragment$key;
};

export function ClaimMintUpsellBanner({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment ClaimMintUpsellBannerFragment on Query {
        viewer {
          ... on Viewer {
            user {
              __typename
            }
          }
        }
      }
    `,
    queryRef
  );

  const { showBottomSheetModal, hideBottomSheetModal } = useBottomSheetModalActions();

  const [claimCode] = usePersistedState(MCHX_CLAIM_CODE_KEY, '');

  const [isUpsellMintBannerDismissed, setIsUpsellMintBannerDismissed] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('isUpsellMintBannerDismissed').then((value) => {
      if (value === 'true') {
        setIsUpsellMintBannerDismissed(true);
      }
    });
  }, []);

  const handleDismissUpsellBanner = useCallback(() => {
    setIsUpsellMintBannerDismissed(true);
    AsyncStorage.setItem('isUpsellMintBannerDismissed', 'true');
  }, []);

  const handleClaimPress = useCallback(() => {
    showBottomSheetModal({ content: <MintCampaignBottomSheet onClose={hideBottomSheetModal} /> });
  }, [hideBottomSheetModal, showBottomSheetModal]);

  const user = query.viewer?.user;

  if (!user || claimCode || isUpsellMintBannerDismissed) {
    return <View className="bg-white dark:bg-black-900" />;
  }

  return (
    <View className="bg-activeBlue dark:bg-darkModeBlue w-full px-4 py-2 flex-row items-center justify-between">
      <View>
        <Typography
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
          className="text-offWhite text-sm"
        >
          Exclusive free mint !
        </Typography>
        <Typography
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
          className="text-offWhite text-xs"
        >
          Claim your free generative work by MCHX
        </Typography>
      </View>
      <View className="flex-row items-center space-x-2">
        <Button
          onPress={handleClaimPress}
          text="claim"
          size="xs"
          variant="secondary"
          fontWeight="Bold"
          eventElementId="Press Claim Upsell Banner"
          eventName="Press Claim Upsell Banner"
          eventContext={contexts.Authentication}
        />
        <GalleryTouchableOpacity
          className="p-2"
          eventElementId="Close Claim Upsell Banner"
          eventName="Close Claim Upsell Banner"
          eventContext={contexts.Authentication}
          onPress={handleDismissUpsellBanner}
        >
          <XMarkIcon color={colors.offWhite} />
        </GalleryTouchableOpacity>
      </View>
    </View>
  );
}
