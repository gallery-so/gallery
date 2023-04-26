import { Suspense } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

import { USERS_PER_PAGE } from '~/components/Trending/constants';
import { LoadingTrendingPage } from '~/components/Trending/LoadingTrendingPage';
import { SuggestedSection } from '~/components/Trending/SuggestedSection';
import { TrendingSection } from '~/components/Trending/TrendingSection';
import { TwitterSection } from '~/components/Trending/TwitterSection';
import { ExploreScreenFragment$key } from '~/generated/ExploreScreenFragment.graphql';
import { ExploreScreenQuery } from '~/generated/ExploreScreenQuery.graphql';

type ExploreScreenInnerProps = {
  queryRef: ExploreScreenFragment$key;
};

function ExploreScreenInner({ queryRef }: ExploreScreenInnerProps) {
  const query = useFragment(
    graphql`
      fragment ExploreScreenFragment on Query {
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

        viewer {
          __typename
          ... on Viewer {
            socialAccounts @required(action: THROW) {
              twitter {
                __typename
              }
            }
          }
        }

        ...TrendingSectionQueryFragment
        ...SuggestedSectionQueryFragment
        ...TwitterSectionQueryFragment
      }
    `,
    queryRef
  );

  const { bottom } = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        paddingBottom: bottom,
      }}
    >
      {query.viewer?.__typename === 'Viewer' && (
        <>
          {query.viewer.socialAccounts?.twitter?.__typename && (
            <TwitterSection
              title="Twitter Friends"
              description="Curators you know from Twitter"
              queryRef={query}
            />
          )}
          <SuggestedSection
            title="In your orbit"
            description="Curators you may enjoy based on your activity"
            queryRef={query}
          />
        </>
      )}
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

export function ExploreScreen() {
  const query = useLazyLoadQuery<ExploreScreenQuery>(
    graphql`
      query ExploreScreenQuery($twitterListFirst: Int!, $twitterListAfter: String) {
        ...ExploreScreenFragment
      }
    `,
    {
      twitterListFirst: USERS_PER_PAGE,
      twitterListAfter: null,
    }
  );

  return (
    <Suspense fallback={<LoadingTrendingPage />}>
      <ExploreScreenInner queryRef={query} />
    </Suspense>
  );
}
