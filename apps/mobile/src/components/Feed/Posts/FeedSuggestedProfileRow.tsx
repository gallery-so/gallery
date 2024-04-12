import { useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { removeNullValues } from 'shared/relay/removeNullValues';

import { TrendingUserCard } from '~/components/Trending/TrendingUserCard';
import { FeedSuggestedProfileRowFragment$key } from '~/generated/FeedSuggestedProfileRowFragment.graphql';

import { Typography } from '../../Typography';

const CARD_HEIGHT = 180;
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
            suggestedUsers(first: 4) @required(action: THROW) {
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
      const usersWithTokenPreviews = users.filter((user) => {
        return user?.galleries?.find(
          (gallery) => removeNullValues(gallery?.tokenPreviews).length > 0
        );
      });
      return usersWithTokenPreviews?.slice(0, 2);
    }
    return users;
  }, [query.viewer?.suggestedUsers]);

  return (
    <View className="pl-4 mt-2 mb-12 space-y-3">
      <Typography
        className="text-sm text-offBlack dark:text-offBlack"
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
