import { useNavigation } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import { useCallback, useMemo } from 'react';
import { View, ViewProps } from 'react-native';
import FastImage from 'react-native-fast-image';
import { graphql, useFragment } from 'react-relay';

import { FollowButton } from '~/components/FollowButton';
import { NftPreviewErrorFallback } from '~/components/NftPreview/NftPreviewErrorFallback';
import { TrendingUserCardFragment$key } from '~/generated/TrendingUserCardFragment.graphql';
import { TrendingUserCardQueryFragment$key } from '~/generated/TrendingUserCardQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { BADGE_ENABLED_COMMUNITY_ADDRESSES } from '~/shared/utils/communities';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Markdown } from '../Markdown';
import { RawNftPreviewAsset } from '../NftPreview/NftPreviewAsset';
import { Typography } from '../Typography';

type Props = {
  userRef: TrendingUserCardFragment$key;
  queryRef: TrendingUserCardQueryFragment$key;
  style?: ViewProps['style'];
};

const markdownStyle = {
  paragraph: {
    marginBottom: 0,
  },
};

export function TrendingUserCard({ style, userRef, queryRef }: Props) {
  const user = useFragment(
    graphql`
      fragment TrendingUserCardFragment on GalleryUser {
        username
        badges {
          imageURL
          contract {
            contractAddress {
              address
            }
          }
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
    return (
      badges
        ?.filter((badge) => badge?.imageURL)
        ?.filter((badge) => {
          return BADGE_ENABLED_COMMUNITY_ADDRESSES.has(
            badge?.contract?.contractAddress?.address ?? ''
          );
        }) ?? []
    );
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

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handlePress = useCallback(() => {
    if (user.username) {
      navigation.push('Profile', { username: user.username });
    }
  }, [navigation, user.username]);

  return (
    <GalleryTouchableOpacity
      onPress={handlePress}
      className="bg-offWhite dark:bg-black-800 flex-1 rounded-md p-2"
      style={[style]}
      eventElementId="Trending User Card"
      eventName="Trending User Card Clicked"
      eventContext={contexts.Explore}
    >
      <View className="mb-2 flex h-20 flex-row space-x-[2]">
        {tokenPreviews.map((tokenPreview, index) => {
          return (
            <View key={index} className="h-full w-1/2">
              <ReportingErrorBoundary fallback={<NftPreviewErrorFallback />}>
                <RawNftPreviewAsset
                  tokenUrl={tokenPreview?.small ?? ''}
                  resizeMode={ResizeMode.COVER}
                />
              </ReportingErrorBoundary>
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
          <Markdown numberOfLines={1} style={markdownStyle}>
            {bioFirstLine}
          </Markdown>
        </View>
      </View>

      <FollowButton queryRef={query} userRef={user} width="grow" />
    </GalleryTouchableOpacity>
  );
}
