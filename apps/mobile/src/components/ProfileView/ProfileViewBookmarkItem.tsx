import { useNavigation } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import React, { useCallback, useMemo, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { graphql, useFragment } from 'react-relay';
import { contexts } from 'shared/analytics/constants';
import { useGetSinglePreviewImage } from 'shared/relay/useGetPreviewImages';
import { truncateAddress } from 'shared/utils/wallet';
import { useNavigateToCommunityScreen } from 'src/hooks/useNavigateToCommunityScreen';

import { ProfileViewBookmarkItemFragment$key } from '~/generated/ProfileViewBookmarkItemFragment.graphql';
import { ProfileViewBookmarkItemQueryFragment$key } from '~/generated/ProfileViewBookmarkItemQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { ImageState, UniversalNftPreviewWithBoundary } from '../NftPreview/UniversalNftPreview';
import { TitleXS } from '../Text';
import { Typography } from '../Typography';

type Props = {
  queryRef: ProfileViewBookmarkItemQueryFragment$key;
  tokenRef: ProfileViewBookmarkItemFragment$key;
};

export default function ProfileViewBookmarkItem({ queryRef, tokenRef }: Props) {
  const query = useFragment(
    graphql`
      fragment ProfileViewBookmarkItemQueryFragment on Query {
        ...UniversalNftPreviewWithBoundaryQueryFragment
      }
    `,
    queryRef
  );

  const token = useFragment(
    graphql`
      fragment ProfileViewBookmarkItemFragment on Token {
        dbid
        definition {
          community {
            name
            ...useNavigateToCommunityScreenFragment
          }
          contract {
            contractAddress {
              address
            }
          }
        }
        ...UniversalNftPreviewWithBoundaryFragment
        ...useGetPreviewImagesSingleFragment
      }
    `,
    tokenRef
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const imageUrl = useGetSinglePreviewImage({
    tokenRef: token,
    preferStillFrameFromGif: true,
    size: 'large',
    // we're simply using the URL for warming the cache;
    // no need to throw an error if image is invalid
    shouldThrow: false,
  });

  const handlePress = useCallback(() => {
    navigation.navigate('UniversalNftDetail', {
      cachedPreviewAssetUrl: imageUrl ?? '',
      tokenId: token.dbid,
    });
  }, [imageUrl, navigation, token.dbid]);

  const contractAddress = token.definition.contract?.contractAddress?.address ?? '';

  const collectionName = useMemo(
    () => token.definition.community?.name || truncateAddress(contractAddress),
    [contractAddress, token.definition.community?.name]
  );

  const navigateToCommunity = useNavigateToCommunityScreen();

  const handleCollectionNamePress = useCallback(() => {
    if (token.definition.community) {
      navigateToCommunity(token.definition.community);
    }
  }, [navigateToCommunity, token.definition.community]);

  const { width: screenWidth } = useWindowDimensions();

  const [selfHeight, setSelfHeight] = useState(0);

  // once the asset is loaded, set the height of ProfileViewBookmarkItem to match the aspect ratio of the token
  const handleAssetLoad = useCallback(
    (imageState: ImageState) => {
      if (
        imageState.kind !== 'loaded' ||
        !imageState.dimensions?.width ||
        !imageState.dimensions?.height
      ) {
        return;
      }
      // determine the intended width of the bookmark item.
      // this is screen width - spacing / 2 (the number of items per row)
      const itemWidth = (screenWidth - 48) / 2;
      const ratio = imageState.dimensions?.width / itemWidth;

      setSelfHeight(imageState.dimensions?.height / ratio);
    },
    [screenWidth]
  );

  return (
    <View className="flex flex-column flex-1 space-x-1 h-full space-y-2 w-1/2 justify-end ">
      <View className="flex border border-red" style={{ height: selfHeight }}>
        <UniversalNftPreviewWithBoundary
          queryRef={query}
          tokenRef={token}
          onPress={handlePress}
          resizeMode={ResizeMode.CONTAIN}
          priority={FastImage.priority.normal}
          size="small"
          onImageStateChange={handleAssetLoad}
        />
      </View>
      <View className="w-full self-end">
        <TitleXS>Collection</TitleXS>
        <GalleryTouchableOpacity
          onPress={handleCollectionNamePress}
          eventName="Pressed Collection Name On Bookmarked Token In Bookmarks Tab"
          eventElementId="Collection Name On Bookmarked Token In Bookmarks Tab"
          eventContext={contexts.Bookmarks}
        >
          <Typography
            className="text-sm leading-4 text-black dark:text-white h-8 mt-1"
            numberOfLines={2}
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
          >
            {collectionName}
          </Typography>
        </GalleryTouchableOpacity>
      </View>
    </View>
  );
}
