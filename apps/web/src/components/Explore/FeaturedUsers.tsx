import { graphql, useLazyLoadQuery } from 'react-relay';

import { FeaturedUsersQuery } from '~/generated/FeaturedUsersQuery.graphql';

import SuggestedSection from './SuggestedSection';
import TrendingSection, { TrendingSectionLoadingState } from './TrendingSection';

export default function FeaturedUsers() {
  const query = useLazyLoadQuery<FeaturedUsersQuery>(
    graphql`
      query FeaturedUsersQuery {
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
          # [GAL-3763] Revive this if / when elon lets us import twitter follower graphs again
          # ... on Viewer {
          # socialAccounts @required(action: THROW) {
          #   twitter {
          #     __typename
          #   }
          # }
          # }
        }
        # ...TwitterSectionQueryFragment

        ...TrendingSectionQueryFragment
        ...SuggestedSectionQueryFragment
      }
    `,
    {}
  );

  return (
    <>
      {query.viewer?.__typename === 'Viewer' && (
        <>
          {
            // [GAL-3763] Revive this if / when elon lets us import twitter follower graphs again
            // query.viewer.socialAccounts?.twitter?.__typename && (
            //   <ReportingErrorBoundary fallback={null}>
            //     <TwitterSection
            //       title="Twitter Friends"
            //       subTitle="Curators you know from Twitter"
            //       queryRef={query}
            //     />
            //   </ReportingErrorBoundary>
            // )
          }
          <SuggestedSection
            title="In your orbit"
            subTitle="Curators you may enjoy based on your activity"
            queryRef={query}
          />
        </>
      )}
      {query.trendingUsers5Days?.__typename === 'TrendingUsersPayload' && (
        <TrendingSection
          title="Weekly Leaderboard"
          subTitle="Trending curators this week"
          trendingUsersRef={query.trendingUsers5Days}
          queryRef={query}
        />
      )}
      {query.trendingUsersAllTime?.__typename === 'TrendingUsersPayload' && (
        <TrendingSection
          title="Hall of Fame"
          subTitle="Top curators with the most all-time views"
          trendingUsersRef={query.trendingUsersAllTime}
          queryRef={query}
        />
      )}{' '}
    </>
  );
}

export function FeaturedUsersLoadingSkeleton() {
  return (
    <>
      <TrendingSectionLoadingState
        title="Weekly Leaderboard"
        subTitle="Trending curators this week"
      />
      <TrendingSectionLoadingState
        title="Hall of Fame"
        subTitle="Top curators with the most all-time views"
      />
    </>
  );
}
