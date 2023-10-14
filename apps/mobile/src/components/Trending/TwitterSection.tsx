import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { TwitterSectionQueryFragment$key } from '~/generated/TwitterSectionQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Typography } from '../Typography';
import { TrendingUserList } from './TrendingUserList';
import { TwitterIcon } from './TwitterIcon';

type Props = {
  title: string;
  description: string;
  queryRef: TwitterSectionQueryFragment$key;
};

export function TwitterSection({ title, description, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment TwitterSectionQueryFragment on Query {
        socialConnections(
          after: $twitterListAfter
          first: $twitterListFirst
          socialAccountType: Twitter
          excludeAlreadyFollowing: false
        ) {
          edges {
            node {
              __typename
              ... on SocialConnection {
                __typename
                galleryUser {
                  ... on GalleryUser {
                    __typename
                    ...TrendingUserListFragment
                  }
                }
              }
            }
          }
        }

        ...TrendingUserListQueryFragment
      }
    `,
    queryRef
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handleSeeAll = useCallback(() => {
    navigation.navigate('TwitterSuggestionList', {
      onUserPress: (username) => {
        navigation.navigate('Profile', { username });
      },
    });
  }, [navigation]);

  const nonNullUsers = useMemo(() => {
    const users = [];

    for (const edge of query.socialConnections?.edges ?? []) {
      if (edge?.node?.__typename === 'SocialConnection' && edge?.node?.galleryUser) {
        users.push(edge.node.galleryUser);
      }
    }

    return users;
  }, [query.socialConnections?.edges]);

  return (
    <View className="flex-1 px-3">
      <View className="flex flex-row items-end justify-between py-3">
        <View>
          <View className="flex flex-row items-center space-x-1">
            <TwitterIcon />
            <Typography
              font={{
                family: 'ABCDiatype',
                weight: 'Bold',
              }}
              className="text-lg text-black dark:text-white"
            >
              {title}
            </Typography>
          </View>
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            className="text-metal text-sm"
          >
            {description}
          </Typography>
        </View>
        <GalleryTouchableOpacity
          eventElementId={null}
          eventName={null}
          eventContext={null}
          onPress={handleSeeAll}
        >
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Regular',
            }}
            className="text-shadow text-sm"
          >
            See all
          </Typography>
        </GalleryTouchableOpacity>
      </View>

      <TrendingUserList usersRef={nonNullUsers} queryRef={query} />
    </View>
  );
}
