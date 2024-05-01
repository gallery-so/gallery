import { useCallback } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import usePersistedState from 'src/hooks/usePersistedState';
import { XMarkIcon } from 'src/icons/XMarkIcon';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { useSanityAnnouncementContext } from '~/contexts/SanityAnnouncementContext';
import { ClaimMintUpsellBannerFragment$key } from '~/generated/ClaimMintUpsellBannerFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';

import { Button } from './Button';
import { GalleryTouchableOpacity } from './GalleryTouchableOpacity';
import MintCampaignBottomSheet from './Mint/MintCampaign/MintCampaignBottomSheet';
import { Typography } from './Typography';

type Props = {
  queryRef: ClaimMintUpsellBannerFragment$key;
  projectInternalId: string;
};

export function ClaimMintUpsellBanner({ queryRef, projectInternalId }: Props) {
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

  const [claimCode] = usePersistedState(`${projectInternalId}-claim-code`, '');

  const [isUpsellMintBannerDismissed, setIsUpsellMintBannerDismissed] = usePersistedState(
    `${projectInternalId}-isUpsellMintBannerDismissed`,
    false
  );

  const handleDismissUpsellBanner = useCallback(() => {
    setIsUpsellMintBannerDismissed(true);
  }, [setIsUpsellMintBannerDismissed]);

  const handleClaimPress = useCallback(() => {
    showBottomSheetModal({
      content: (
        <MintCampaignBottomSheet
          onClose={hideBottomSheetModal}
          projectInternalId={projectInternalId}
        />
      ),
    });
  }, [hideBottomSheetModal, projectInternalId, showBottomSheetModal]);

  const { announcement } = useSanityAnnouncementContext();

  const user = query.viewer?.user;

  if (!user || !announcement || claimCode || isUpsellMintBannerDismissed) {
    return <View className="bg-white dark:bg-black-900" />;
  }

  return (
    <View className="bg-activeBlue dark:bg-darkModeBlue w-full px-4 py-2 flex-row items-center justify-between">
      <View>
        <Typography
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
          className="text-offWhite text-sm"
        >
          Exclusive free mint
        </Typography>
        <Typography
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
          className="text-offWhite text-xs"
        >
          {announcement.description}
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
