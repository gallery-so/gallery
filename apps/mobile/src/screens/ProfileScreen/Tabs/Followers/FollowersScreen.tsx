import { useRoute } from '@react-navigation/native';
import { useMemo } from 'react';
import { View } from 'react-native';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { UserFollowList } from '~/components/UserFollowList/UserFollowList';
import { FollowersScreenFragment$key } from '~/generated/FollowersScreenFragment.graphql';
import { FollowersScreenQuery } from '~/generated/FollowersScreenQuery.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

export function FollowersScreen() {
  const route = useRoute();

  let username: string | null = null;
  if (route.params && 'username' in route.params) {
    username = route.params.username as string;
  }

  const query = useLazyLoadQuery<FollowersScreenQuery>(
    graphql`
      query FollowersScreenQuery($username: String!, $hasUsername: Boolean!) {
        userByUsername(username: $username) @include(if: $hasUsername) {
          ... on GalleryUser {
            ...FollowersScreenFragment
          }
        }

        viewer @skip(if: $hasUsername) {
          ... on Viewer {
            user {
              ...FollowersScreenFragment
            }
          }
        }

        ...UserFollowListQueryFragment
      }
    `,
    { username: username ?? '', hasUsername: username !== null }
  );

  const userRef = query.userByUsername ?? query.viewer?.user ?? null;

  const user = useFragment<FollowersScreenFragment$key>(
    graphql`
      fragment FollowersScreenFragment on GalleryUser {
        followers {
          ...UserFollowListFragment
        }
      }
    `,
    userRef
  );

  const followers = useMemo(() => {
    return removeNullValues(user?.followers);
  }, [user?.followers]);

  return (
    <View className="flex-1">
      <UserFollowList userRefs={followers} queryRef={query} />
    </View>
  );
}
