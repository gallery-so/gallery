import { Suspense } from 'react';
import { ScrollView, View } from 'react-native';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

import { SuggestedSection } from '~/components/Trending/SuggestedSection';
import { TrendingSection } from '~/components/Trending/TrendingSection';
import { FeaturedScreenFragment$key } from '~/generated/FeaturedScreenFragment.graphql';
import { FeaturedScreenQuery } from '~/generated/FeaturedScreenQuery.graphql';

type FeaturedScreenInnerProps = {
  queryRef: FeaturedScreenFragment$key;
};
function FeaturedScreenInner({ queryRef }: FeaturedScreenInnerProps) {
  const query = useFragment(
    graphql`
      fragment FeaturedScreenFragment on Query {
        trendingUsers5Days: trendingUsers(input: { report: LAST_5_DAYS }) {
          ... on TrendingUsersPayload {
            __typename
            ...TrendingSectionFragment
          }
        }
        trendingUsersAllTime: trendingUsers(input: { report: ALL_TIME }) {
          ... on TrendingUsersPayload {
            __typename
            ...TrendingSectionFragment
          }
        }

        # viewer {
        #   __typename
        #   ... on Viewer {
        #     socialAccounts @required(action: THROW) {
        #       twitter {
        #         __typename
        #       }
        #     }
        #   }
        # }

        ...TrendingSectionQueryFragment
        ...SuggestedSectionQueryFragment
      }
    `,
    queryRef
  );

  return (
    <ScrollView className="flex-1">
      <SuggestedSection
        title="In your orbit"
        description="Curators you may enjoy based on your activity"
        queryRef={query}
      />
      {query.trendingUsers5Days?.__typename === 'TrendingUsersPayload' && (
        <TrendingSection
          title="Weekly leaderboard"
          description="Trending curators this week"
          queryRef={query}
          trendingUsersRef={query.trendingUsers5Days}
        />
      )}
      {query.trendingUsersAllTime?.__typename === 'TrendingUsersPayload' && (
        <TrendingSection
          title="Hall of Fame"
          description="Top curators with the most all-time views"
          queryRef={query}
          trendingUsersRef={query.trendingUsersAllTime}
        />
      )}
    </ScrollView>
  );
}

export function FeaturedScreen() {
  const query = useLazyLoadQuery<FeaturedScreenQuery>(
    graphql`
      query FeaturedScreenQuery {
        ...FeaturedScreenFragment
      }
    `,
    {}
  );

  return (
    // TODO: Add Suspense fallback
    <Suspense fallback={<View />}>
      <FeaturedScreenInner queryRef={query} />
    </Suspense>
  );
}
