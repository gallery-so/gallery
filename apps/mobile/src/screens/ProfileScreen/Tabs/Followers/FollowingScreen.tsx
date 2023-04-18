import { useRoute } from '@react-navigation/native';
import { useMemo } from 'react';
import { View } from 'react-native';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { UserFollowList } from '~/components/UserFollowList/UserFollowList';
import { FollowingScreenFragment$key } from '~/generated/FollowingScreenFragment.graphql';
import { FollowingScreenQuery } from '~/generated/FollowingScreenQuery.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

export function FollowingScreen() {
  const route = useRoute();

  let username: string | null = null;
  if (route.params && 'username' in route.params) {
    username = route.params.username as string;
  }

  const query = useLazyLoadQuery<FollowingScreenQuery>(
    graphql`
      query FollowingScreenQuery($username: String!, $hasUsername: Boolean!) {
        userByUsername(username: $username) @include(if: $hasUsername) {
          ... on GalleryUser {
            ...FollowingScreenFragment
          }
        }

        viewer @skip(if: $hasUsername) {
          ... on Viewer {
            user {
              ...FollowingScreenFragment
            }
          }
        }

        ...UserFollowListQueryFragment
      }
    `,
    { username: username ?? '', hasUsername: username !== null }
  );

  const userRef = query.userByUsername ?? query.viewer?.user ?? null;

  const user = useFragment<FollowingScreenFragment$key>(
    graphql`
      fragment FollowingScreenFragment on GalleryUser {
        following {
          ...UserFollowListFragment
        }
      }
    `,
    userRef
  );

  const following = useMemo(() => {
    return removeNullValues(user?.following);
  }, [user?.following]);

  return (
    <View className="flex-1">
      <UserFollowList userRefs={following} queryRef={query} />
    </View>
  );
}
