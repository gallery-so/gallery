import { useNavigation } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import { useCallback } from 'react';
import { View, ViewProps } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { OptionIcon } from 'src/icons/OptionIcon';
import isFeatureEnabled, { FeatureFlag } from 'src/utils/isFeatureEnabled';

import { RawNftPreviewAsset } from '~/components/NftPreview/NftPreviewAsset';
import { NftPreviewErrorFallback } from '~/components/NftPreview/NftPreviewErrorFallback';
import { Typography } from '~/components/Typography';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { GalleryPreviewCardFragment$key } from '~/generated/GalleryPreviewCardFragment.graphql';
import { GalleryPreviewCardQueryFragment$key } from '~/generated/GalleryPreviewCardQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import unescape from '~/shared/utils/unescape';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { GalleryPreviewCardBottomSheet } from './GalleryPreviewCardBottomSheet';

type GalleryPreviewCardProps = {
  isFeatured: boolean;
  galleryRef: GalleryPreviewCardFragment$key;
  queryRef: GalleryPreviewCardQueryFragment$key;
};

export function GalleryPreviewCard({ galleryRef, isFeatured, queryRef }: GalleryPreviewCardProps) {
  const gallery = useFragment(
    graphql`
      fragment GalleryPreviewCardFragment on Gallery {
        __typename
        dbid
        name
        description

        tokenPreviews {
          medium
        }
        ...GalleryPreviewCardBottomSheetFragment
      }
    `,
    galleryRef
  );

  const query = useFragment(
    graphql`
      fragment GalleryPreviewCardQueryFragment on Query {
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const isGalleryEditorEnabled = isFeatureEnabled(FeatureFlag.GALLERY_EDITOR, query);

  const [firstToken, secondToken, thirdToken, fourthToken] = gallery.tokenPreviews ?? [];
  const descriptionFirstLine = gallery.description?.split('\n')[0];
  const { showBottomSheetModal, hideBottomSheetModal } = useBottomSheetModalActions();

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handlePress = useCallback(() => {
    navigation.push('Gallery', { galleryId: gallery.dbid });
  }, [gallery.dbid, navigation]);

  const handleOptionPress = useCallback(() => {
    showBottomSheetModal({
      content: (
        <GalleryPreviewCardBottomSheet galleryRef={gallery} onClose={hideBottomSheetModal} />
      ),
    });
  }, [gallery, hideBottomSheetModal, showBottomSheetModal]);

  return (
    <GalleryTouchableOpacity
      onPress={handlePress}
      className="bg-offWhite dark:bg-black-800 flex w-full flex-col space-y-3 rounded-xl p-3"
      eventElementId="Gallery Preview Card"
      eventName="Gallery Preview Card Clicked"
      eventContext={contexts.UserGallery}
    >
      <View className="flex flex-row items-center justify-center">
        <View className="flex flex-1 flex-col">
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {gallery.name ? unescape(gallery.name) : 'Untitled'}
          </Typography>
          {descriptionFirstLine && (
            <Typography
              numberOfLines={1}
              className="text-sm"
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
            >
              {descriptionFirstLine}
            </Typography>
          )}
        </View>

        <View className="flex-row items-center gap-2">
          {isFeatured ? (
            <View className="border-activeBlue dark:border-darkModeBlue dark:border-offWhite py-1/2 rounded-sm border px-1">
              <Typography
                className="text-activeBlue dark:text-offWhite text-xs"
                font={{ family: 'ABCDiatype', weight: 'Regular' }}
              >
                Featured
              </Typography>
            </View>
          ) : (
            <View />
          )}

          {isGalleryEditorEnabled && (
            <GalleryTouchableOpacity
              onPress={handleOptionPress}
              eventElementId={null}
              eventName={null}
              eventContext={null}
              className="rounded-full p-1"
              activeOpacity={0.5}
            >
              <OptionIcon />
            </GalleryTouchableOpacity>
          )}
        </View>
      </View>

      <View className="flex flex-col space-y-0.5">
        <View className="flex w-full flex-row space-x-0.5">
          <TokenCell tokenUrl={firstToken?.medium} />
          <TokenCell tokenUrl={secondToken?.medium} />
        </View>
        <View className="flex w-full flex-row space-x-0.5">
          <TokenCell tokenUrl={thirdToken?.medium} />
          <TokenCell tokenUrl={fourthToken?.medium} />
        </View>
      </View>
    </GalleryTouchableOpacity>
  );
}

function TokenCell({
  tokenUrl,
  style,
}: {
  style?: ViewProps['style'];
  tokenUrl: string | null | undefined;
}) {
  return (
    <View className="flex flex-1" style={style}>
      <View className="aspect-square w-full">
        {tokenUrl ? (
          <ReportingErrorBoundary fallback={<NftPreviewErrorFallback />}>
            <RawNftPreviewAsset tokenUrl={tokenUrl} resizeMode={ResizeMode.COVER} />
          </ReportingErrorBoundary>
        ) : (
          <View />
        )}
      </View>
    </View>
  );
}
