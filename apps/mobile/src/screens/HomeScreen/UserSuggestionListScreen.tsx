import { Suspense, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

import { ModalContainer } from '~/components/ModalContainer';
import { LoadingFollowerList } from '~/components/Trending/LoadingFollowerList';
import { Typography } from '~/components/Typography';
import { UserFollowList } from '~/components/UserFollowList/UserFollowList';
import { UserSuggestionListScreenInnerFragment$key } from '~/generated/UserSuggestionListScreenInnerFragment.graphql';
import { UserSuggestionListScreenQuery } from '~/generated/UserSuggestionListScreenQuery.graphql';

type Props = {
  queryRef: UserSuggestionListScreenInnerFragment$key;
};

export function InnerUserSuggestionListScreen({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment UserSuggestionListScreenInnerFragment on Query {
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
                    ...UserFollowListFragment
                  }
                }
              }
            }
          }
        }
        ...UserFollowListQueryFragment
      }
    `,
    queryRef
  );

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
    <View className="flex flex-1 flex-col">
      <Typography
        font={{
          family: 'ABCDiatype',
          weight: 'Bold',
        }}
        className="text-lg"
      >
        Suggested curators for you
      </Typography>
      <View className="-mx-4 flex-grow">
        <UserFollowList userRefs={nonNullUsers} queryRef={query} />
      </View>
    </View>
  );
}

export function UserSuggestionListScreen() {
  const query = useLazyLoadQuery<UserSuggestionListScreenQuery>(
    graphql`
      query UserSuggestionListScreenQuery {
        ...UserSuggestionListScreenInnerFragment
      }
    `,
    {}
  );
  return (
    <ModalContainer withBackButton>
      <Suspense fallback={<LoadingFollowerList />}>
        <InnerUserSuggestionListScreen queryRef={query} />
      </Suspense>
    </ModalContainer>
  );
}
