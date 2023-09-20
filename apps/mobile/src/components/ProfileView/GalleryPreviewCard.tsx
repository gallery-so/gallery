import { useNavigation } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import { useCallback } from 'react';
import { View, ViewProps } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { RawNftPreviewAsset } from '~/components/NftPreview/NftPreviewAsset';
import { NftPreviewErrorFallback } from '~/components/NftPreview/NftPreviewErrorFallback';
import { Typography } from '~/components/Typography';
import { GalleryPreviewCardFragment$key } from '~/generated/GalleryPreviewCardFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import unescape from '~/shared/utils/unescape';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';

type GalleryPreviewCardProps = {
  isFeatured: boolean;
  galleryRef: GalleryPreviewCardFragment$key;
};

export function GalleryPreviewCard({ galleryRef, isFeatured }: GalleryPreviewCardProps) {
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
      }
    `,
    galleryRef
  );

  const [firstToken, secondToken, thirdToken, fourthToken] = gallery.tokenPreviews ?? [];
  const descriptionFirstLine = gallery.description?.split('\n')[0];

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handlePress = useCallback(() => {
    navigation.push('Gallery', { galleryId: gallery.dbid });
  }, [gallery.dbid, navigation]);

  return (
    <GalleryTouchableOpacity
      onPress={handlePress}
      className="bg-offWhite dark:bg-black-800 flex w-full flex-col space-y-3 rounded-xl p-3"
      eventElementId="Gallery Preview Card"
      eventName="Gallery Preview Card Clicked"
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

        {isFeatured ? (
          <View className="border-activeBlue dark:border-offWhite py-1/2 rounded-sm border px-1">
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
