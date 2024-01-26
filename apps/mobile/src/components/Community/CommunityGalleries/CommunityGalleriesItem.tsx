import { useNavigation } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import { useCallback, useMemo } from 'react';
import { View, ViewProps } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { contexts } from 'shared/analytics/constants';
import { ReportingErrorBoundary } from 'shared/errors/ReportingErrorBoundary';
import { removeNullValues } from 'shared/relay/removeNullValues';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { RawNftPreviewAsset } from '~/components/NftPreview/NftPreviewAsset';
import { NftPreviewErrorFallback } from '~/components/NftPreview/NftPreviewErrorFallback';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { Typography } from '~/components/Typography';
import { CommunityGalleriesItemFragment$key } from '~/generated/CommunityGalleriesItemFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

type Props = {
  communityGalleryRef: CommunityGalleriesItemFragment$key;
  style?: ViewProps['style'];
};

export function CommunityGalleriesItem({ communityGalleryRef, style }: Props) {
  const communityGallery = useFragment(
    graphql`
      fragment CommunityGalleriesItemFragment on CommunityGallery {
        __typename
        gallery {
          dbid
          name
          owner {
            username
            ...ProfilePictureFragment
          }
        }
        tokenPreviews {
          medium
        }
      }
    `,
    communityGalleryRef
  );

  const { gallery } = communityGallery;

  const nonNullTokenPreviews = useMemo(() => {
    return removeNullValues(communityGallery.tokenPreviews);
  }, [communityGallery.tokenPreviews]);

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handlePress = useCallback(() => {
    if (!gallery?.dbid) return;
    navigation.push('Gallery', { galleryId: gallery.dbid });
  }, [gallery?.dbid, navigation]);

  return (
    <GalleryTouchableOpacity
      className="p-2 bg-offWhite dark:bg-black-700 space-y-1 w-1/2 rounded"
      eventElementId="Community Gallery Item"
      eventName="Press Community Gallery Item"
      eventContext={contexts.Community}
      style={style}
      onPress={handlePress}
    >
      <View className="flex w-full flex-row space-x-0.5">
        {nonNullTokenPreviews.map((tokenPreview, index) => (
          <NftPreview key={index} tokenUrl={tokenPreview.medium} />
        ))}
      </View>
      <View className="space-y-1">
        <View className="flex-row items-center gap-1">
          {gallery?.owner && <ProfilePicture size="sm" userRef={gallery.owner} />}
          <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }} className="text-sm">
            {gallery?.owner?.username}
          </Typography>
        </View>
        <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }} className="text-xs">
          {gallery?.name || 'Untitled'}
        </Typography>
      </View>
    </GalleryTouchableOpacity>
  );
}

function NftPreview({
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
