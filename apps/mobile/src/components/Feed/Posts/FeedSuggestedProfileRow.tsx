import { useMemo } from 'react';
import { Dimensions, FlatList,View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { removeNullValues } from 'shared/relay/removeNullValues';

import { TrendingUserCard } from '~/components/Trending/TrendingUserCard';
import { FeedSuggestedProfileRowFragment$key } from '~/generated/FeedSuggestedProfileRowFragment.graphql';

import { Typography } from '../../Typography';

const CARD_HEIGHT = 180;
const CARD_ROW_HORIZONTAL_PADDING = 42;

type FeedSuggestedProfileRowProps = {
  queryRef: FeedSuggestedProfileRowFragment$key;
};

export function FeedSuggestedProfileRow({ queryRef }: FeedSuggestedProfileRowProps) {
  const query = useFragment(
    graphql`
      fragment FeedSuggestedProfileRowFragment on Query {
        viewer @required(action: THROW) {
          ... on Viewer {
            suggestedUsers(first: 24) @required(action: THROW) {
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
      return usersWithTokenPreviews;
    }
    return users;
  }, [query.viewer?.suggestedUsers]);

  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const cardWidth = (SCREEN_WIDTH - CARD_ROW_HORIZONTAL_PADDING) / 2;

  return (
    <View className="pl-4 mt-2 mb-12 space-y-3">
      <Typography
        className="text-sm text-offBlack dark:text-offBlack"
        font={{ family: 'ABCDiatype', weight: 'Bold' }}
      >
        Suggested creators and collectors
      </Typography>
      <FlatList
        data={suggestedUsers}
        horizontal={true}
        renderItem={({ item, index }) => (
          <View style={{ width: cardWidth, height: CARD_HEIGHT, marginLeft: index === 0 ? 0 : 4 }}>
            <TrendingUserCard userRef={item} queryRef={query} />
          </View>
        )}
        keyExtractor={(_, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}
