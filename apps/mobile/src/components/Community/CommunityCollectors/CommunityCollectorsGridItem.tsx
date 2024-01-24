import { useNavigation } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import { useCallback } from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { graphql, useFragment } from 'react-relay';
import { useGetSinglePreviewImage } from 'shared/relay/useGetPreviewImages';

import { UniversalNftPreviewWithBoundary } from '~/components/NftPreview/UniversalNftPreview';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { Typography } from '~/components/Typography';
import { CommunityCollectorsGridItemFragment$key } from '~/generated/CommunityCollectorsGridItemFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

type Props = {
  tokenRef: CommunityCollectorsGridItemFragment$key;
};

export function CommunityCollectorsGridItem({ tokenRef }: Props) {
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

  return (
    <View className="w-1/2 space-y-2">
      <View className="h-[175] w-[175]">
        <UniversalNftPreviewWithBoundary
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
        <View className="flex-row space-x-1 items-center">
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
        </View>
      </View>
    </View>
  );
}
