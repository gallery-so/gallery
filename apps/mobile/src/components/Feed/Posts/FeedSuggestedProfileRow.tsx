import { graphql, useFragment } from 'react-relay';
import { View } from 'react-native';
import { useMemo } from 'react';

import { FeedSuggestedProfileRowFragment$key } from '~/generated/FeedSuggestedProfileRowFragment.graphql';

const CARD_HEIGHT = 145;
const CARD_WIDTH = 180;

type FeedSuggestedProfileRowProps = {
  queryRef: FeedSuggestedProfileRowFragment$key;
};

export function FeedSuggestedProfileRow({ queryRef }: FeedSuggestedProfileRowProps) {
  const query = useFragment(
    graphql`
      fragment FeedSuggestedProfileRowFragment on Query {
        viewer @required(action: THROW) {
          ... on Viewer {
            suggestedUsers(first: 2) @required(action: THROW) {
              __typename
              edges {
                node {
                  __typename
                  ... on GalleryUser {
                    galleries {
                      tokenPreviews {
                        __typename
                      }
                    }
                    ...UserSearchResultFragment
                    ...TrendingUserCardFragment
                  }
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const suggestedUsers = useMemo(() => {
    const users = [];
    if (query.viewer?.suggestedUsers?.__typename === 'UsersConnection') {
      for (const edge of query.viewer?.suggestedUsers?.edges ?? []) {
        if (edge?.node) {
          users.push(edge.node);
        }
      }
    }
    if (users) {
      return users?.slice(0, 2);
    }
    return users;
  }, []);

  return (
    <View>
      {suggestedUsers?.map((user, idx) => {
        return (
          <View className="mb-1" style={{ width: CARD_WIDTH, height: CARD_HEIGHT }} key={idx}>
            <TrendingUserCard userRef={user} queryRef={query} />
          </View>
        );
      })}
    </View>
  );
}
