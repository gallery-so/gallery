import { ResizeMode } from 'expo-av';
import { useMemo } from 'react';
import { TouchableOpacity, View, ViewProps } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { TrendingUserCardFragment$key } from '~/generated/TrendingUserCardFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { Markdown } from '../Markdown';
import { NftPreviewAsset } from '../NftPreview/NftPreviewAsset';
import { Typography } from '../Typography';

type Props = {
  userRef: TrendingUserCardFragment$key;
  style?: ViewProps['style'];
};

export function TrendingUserCard({ style, userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment TrendingUserCardFragment on GalleryUser {
        username
        # badges {
        #   __typename
        # }
        bio
        galleries {
          tokenPreviews {
            large
          }
          hidden
        }
      }
    `,
    userRef
  );

  const { bio } = user;
  const userGalleries = useMemo(() => {
    return user.galleries ?? [];
  }, [user.galleries]);

  const tokenPreviews = useMemo(() => {
    const gallery = userGalleries.find(
      (gallery) => !gallery?.hidden && removeNullValues(gallery?.tokenPreviews).length > 0
    );

    return gallery?.tokenPreviews?.slice(0, 2) ?? [];
  }, [userGalleries]);

  const bioFirstLine = useMemo(() => {
    if (!bio) {
      return '';
    }
    return bio.split('\n')[0] ?? '';
  }, [bio]);

  return (
    <View className="bg-offWhite flex-1 rounded-md p-2" style={[style]}>
      <View className="mb-2 flex h-20 flex-row space-x-[2]">
        {tokenPreviews.map((tokenPreview, index) => {
          return (
            <View key={index} className="h-full w-1/2">
              <NftPreviewAsset tokenUrl={tokenPreview?.large ?? ''} resizeMode={ResizeMode.COVER} />
            </View>
          );
        })}
      </View>

      <View className="mb-2">
        <Typography
          font={{
            family: 'GTAlpina',
            weight: 'StandardLight',
          }}
        >
          {user.username}
        </Typography>
        <View className="h-5">
          <Markdown numberOfLines={1}>{bioFirstLine}</Markdown>
        </View>
      </View>

      <TouchableOpacity onPress={() => {}} className="bg-offBlack rounded py-1">
        <Typography
          font={{
            family: 'ABCDiatype',
            weight: 'Bold',
          }}
          className="text-center text-xs text-white"
        >
          Follow
        </Typography>
      </TouchableOpacity>
    </View>
  );
}
