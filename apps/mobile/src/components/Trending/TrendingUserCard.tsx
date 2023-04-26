import { ResizeMode } from 'expo-av';
import { useMemo } from 'react';
import { View, ViewProps } from 'react-native';
import FastImage from 'react-native-fast-image';
import { graphql, useFragment } from 'react-relay';

import { TrendingUserCardFragment$key } from '~/generated/TrendingUserCardFragment.graphql';
import { TrendingUserCardQueryFragment$key } from '~/generated/TrendingUserCardQueryFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { Markdown } from '../Markdown';
import { NftPreviewAsset } from '../NftPreview/NftPreviewAsset';
import { Typography } from '../Typography';
import { FollowButton } from './FollowButton';

type Props = {
  userRef: TrendingUserCardFragment$key;
  queryRef: TrendingUserCardQueryFragment$key;
  style?: ViewProps['style'];
};

export function TrendingUserCard({ style, userRef, queryRef }: Props) {
  const user = useFragment(
    graphql`
      fragment TrendingUserCardFragment on GalleryUser {
        username
        badges {
          imageURL
        }
        bio
        galleries {
          tokenPreviews {
            small
          }
          hidden
        }
        ...FollowButtonUserFragment
      }
    `,
    userRef
  );

  const query = useFragment(
    graphql`
      fragment TrendingUserCardQueryFragment on Query {
        ...FollowButtonQueryFragment
      }
    `,
    queryRef
  );

  const { badges, bio } = user;

  const userGalleries = useMemo(() => {
    return user.galleries ?? [];
  }, [user.galleries]);

  const filteredBadges = useMemo(() => {
    return badges?.filter((badge) => badge?.imageURL) ?? [];
  }, [badges]);

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
              <NftPreviewAsset tokenUrl={tokenPreview?.small ?? ''} resizeMode={ResizeMode.COVER} />
            </View>
          );
        })}
      </View>

      <View className="mb-2">
        <View className="flex flex-row items-center space-x-1">
          <Typography
            font={{
              family: 'GTAlpina',
              weight: 'StandardLight',
            }}
          >
            {user.username}
          </Typography>
          {filteredBadges.map((badge, index) => {
            return (
              <FastImage
                key={index}
                className="h-4 w-4 rounded-full"
                source={{
                  uri: badge?.imageURL ?? '',
                }}
              />
            );
          })}
        </View>
        <View className="h-5">
          <Markdown numberOfLines={1}>{bioFirstLine}</Markdown>
        </View>
      </View>

      <FollowButton queryRef={query} userRef={user} />
    </View>
  );
}
