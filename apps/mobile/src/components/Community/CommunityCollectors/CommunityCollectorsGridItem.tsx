import { useNavigation } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import { useCallback } from 'react';
import { View, ViewProps } from 'react-native';
import FastImage from 'react-native-fast-image';
import { graphql, useFragment } from 'react-relay';
import { contexts } from 'shared/analytics/constants';
import { useGetSinglePreviewImage } from 'shared/relay/useGetPreviewImages';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { UniversalNftPreviewWithBoundary } from '~/components/NftPreview/UniversalNftPreview';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { Typography } from '~/components/Typography';
import { CommunityCollectorsGridItemFragment$key } from '~/generated/CommunityCollectorsGridItemFragment.graphql';
import { CommunityCollectorsGridItemQueryFragment$key } from '~/generated/CommunityCollectorsGridItemQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

type Props = {
  queryRef: CommunityCollectorsGridItemQueryFragment$key;
  tokenRef: CommunityCollectorsGridItemFragment$key;
  style?: ViewProps['style'];
};

export function CommunityCollectorsGridItem({ queryRef, tokenRef, style }: Props) {
  const query = useFragment(
    graphql`
      fragment CommunityCollectorsGridItemQueryFragment on Query {
        ...UniversalNftPreviewWithBoundaryQueryFragment
      }
    `,
    queryRef
  );

  const token = useFragment(
    graphql`
      fragment CommunityCollectorsGridItemFragment on Token {
        __typename
        dbid
        definition {
          name
        }
        owner {
          __typename
          dbid
          username
          ...ProfilePictureFragment
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

  const handleUsernamePress = useCallback(() => {
    if (!token.owner?.username) return;
    navigation.navigate('Profile', {
      username: token.owner?.username,
    });
  }, [navigation, token.owner?.username]);

  return (
    <View className="w-1/2 space-y-2" style={style}>
      <View className="h-[175] w-[175] max-w-full">
        <UniversalNftPreviewWithBoundary
          queryRef={query}
          tokenRef={token}
          onPress={handlePress}
          resizeMode={ResizeMode.CONTAIN}
          priority={FastImage.priority.normal}
          size="small"
        />
      </View>
      <View>
        <Typography
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
          className="text-sm"
          numberOfLines={2}
          style={{
            lineHeight: 0,
          }}
        >
          {token.definition.name}
        </Typography>
        <GalleryTouchableOpacity
          onPress={handleUsernamePress}
          eventElementId="Community Collectors Grid Item Username"
          eventName="Press Community Collectors Grid Item Username"
          eventContext={contexts.Community}
          className="flex-row space-x-1 items-center"
        >
          <ProfilePicture size="xxs" userRef={token.owner} />
          <Typography
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
            className="text-sm"
            numberOfLines={1}
            style={{
              lineHeight: 0,
            }}
          >
            {token.owner?.username}
          </Typography>
        </GalleryTouchableOpacity>
      </View>
    </View>
  );
}
