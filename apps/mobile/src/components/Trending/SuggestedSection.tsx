import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { SuggestedSectionQueryFragment$key } from '~/generated/SuggestedSectionQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Typography } from '../Typography';
import { TrendingUserList } from './TrendingUserList';

type Props = {
  title: string;
  description: string;
  queryRef: SuggestedSectionQueryFragment$key;
};

export function SuggestedSection({ title, description, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment SuggestedSectionQueryFragment on Query {
        viewer @required(action: THROW) {
          ... on Viewer {
            suggestedUsers(first: 24)
              @connection(key: "ExploreFragment_suggestedUsers")
              @required(action: THROW) {
              edges {
                node {
                  __typename
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
    navigation.navigate('UserSuggestionList', {
      onUserPress: (username) => {
        navigation.push('Profile', { username });
      },
    });
  }, [navigation]);

  // map edge nodes to an array of GalleryUsers
  const nonNullUsers = useMemo(() => {
    const users = [];

    for (const edge of query.viewer.suggestedUsers?.edges ?? []) {
      if (edge?.node) {
        users.push(edge.node);
      }
    }

    return users;
  }, [query.viewer.suggestedUsers?.edges]);

  return (
    <View className="flex-1 px-3">
      <View className="flex flex-row items-end justify-between py-3">
        <View>
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            className="text-lg text-black dark:text-white"
          >
            {title}
          </Typography>
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
          eventElementId="Suggested Users See All Button"
          eventName="See All Suggested Users"
          eventContext={contexts.Explore}
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
