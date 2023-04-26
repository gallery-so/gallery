import { Suspense, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

import { ModalContainer } from '~/components/ModalContainer';
import { LoadingFollowerList } from '~/components/Trending/LoadingFollowerList';
import { SuggestionUser } from '~/components/Trending/SuggestionUser';
import { Typography } from '~/components/Typography';
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
                    ...SuggestionUserFragment
                  }
                }
              }
            }
          }
        }
        ...SuggestionUserQueryFragment
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
      <View className="flex-grow">
        <ScrollView>
          {nonNullUsers.map((user, index) => (
            <SuggestionUser key={index} userRef={user} queryRef={query} />
          ))}
        </ScrollView>
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
