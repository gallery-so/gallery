import { graphql, useFragment } from 'react-relay';
import { View } from 'react-native';
import { useMemo } from 'react';

import { FeedSuggestedProfileRowFragment$key } from '~/generated/FeedSuggestedProfileRowFragment.graphql';
import { TrendingUserCard } from '~/components/Trending/TrendingUserCard';
import { Typography } from '../../Typography';

const CARD_HEIGHT = 165;
const CARD_WIDTH = 186;

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
                    ...TrendingUserCardFragment
                  }
                }
              }
            }
          }
        }
        ...TrendingUserCardQueryFragment
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
  }, [query.viewer?.suggestedUsers]);

  return (
    <View className="pl-2 pt-12 pb-12 space-y-3 mb-4 mt-4">
      <Typography
        className="text-md text-offWhite dark:text-offBlack"
        font={{ family: 'ABCDiatype', weight: 'Bold' }}
      >
        Suggested creators and collectors
      </Typography>
      <View className="space-x-1 flex flex-row">
        {suggestedUsers?.map((user, idx) => {
          return (
            <View className="mb-1" style={{ width: CARD_WIDTH, height: CARD_HEIGHT }} key={idx}>
              <TrendingUserCard userRef={user} queryRef={query} />
            </View>
          );
        })}
      </View>
    </View>
  );
}
