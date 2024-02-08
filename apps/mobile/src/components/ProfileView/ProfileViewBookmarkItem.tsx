import { useNavigation } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import React, { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { graphql, useFragment } from 'react-relay';
import { useGetSinglePreviewImage } from 'shared/relay/useGetPreviewImages';

import { ProfileViewBookmarkItemFragment$key } from '~/generated/ProfileViewBookmarkItemFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

import { UniversalNftPreviewWithBoundary } from '../NftPreview/UniversalNftPreview';
import { truncateAddress } from 'shared/utils/wallet';
import { TitleXS } from '../Text';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { extractRelevantMetadataFromCommunity } from 'shared/utils/extractRelevantMetadataFromCommunity';
import { useNavigateToCommunityScreen } from 'src/hooks/useNavigateToCommunityScreen';
import { contexts } from 'shared/analytics/constants';

type Props = {
  tokenRef: ProfileViewBookmarkItemFragment$key;
};

export default function ProfileViewBookmarkItem({ tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment ProfileViewBookmarkItemFragment on Token {
        dbid
        definition {
          community {
            name
            ...useNavigateToCommunityScreenFragment
            # ...getCommunityUrlFromCommunityFragment
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

  return (
    <View className="border border-black flex flex-column flex-1 space-x-1 h-full space-y-2">
      <View className="aspect-square">
        <UniversalNftPreviewWithBoundary
          tokenRef={token}
          onPress={handlePress}
          resizeMode={ResizeMode.CONTAIN}
          priority={FastImage.priority.normal}
          size="small"
        />
      </View>
      <View>
        <TitleXS>Collection</TitleXS>
        <GalleryTouchableOpacity
          onPress={handleCollectionNamePress}
          eventName="Pressed Collection Name On Bookmarked Token In Bookmarks Tab"
          eventElementId="Collection Name On Bookmarked Token In Bookmarks Tab"
          eventContext={contexts.Bookmarks}
        >
          <Text>{collectionName}</Text>
        </GalleryTouchableOpacity>
      </View>
    </View>
  );
}
