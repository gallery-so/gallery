import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { ExploreFragment$key } from '~/generated/ExploreFragment.graphql';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

import { VStack } from '../core/Spacer/Stack';
import SuggestedSection from './SuggestedSection';
import TrendingSection from './TrendingSection';
import TwitterSection from './TwitterSection';

type Props = {
  queryRef: ExploreFragment$key;
};

export default function Explore({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment ExploreFragment on Query {
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

  return (
    <StyledExplorePage gap={48}>
      {query.viewer?.__typename === 'Viewer' && (
        <>
          {query.viewer.socialAccounts?.twitter?.__typename && (
            <ReportingErrorBoundary fallback={null}>
              <TwitterSection
                title="Twitter Friends"
                subTitle="Curators you know from Twitter"
                queryRef={query}
              />
            </ReportingErrorBoundary>
          )}
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
      )}
    </StyledExplorePage>
  );
}

const StyledExplorePage = styled(VStack)`
  width: 100%;
  flex: 1;
  padding: 16px 0;
`;
