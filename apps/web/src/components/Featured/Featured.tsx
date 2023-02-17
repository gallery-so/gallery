import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { FeaturedFragment$key } from '~/generated/FeaturedFragment.graphql';

import { VStack } from '../core/Spacer/Stack';
import FeaturedSection from './FeaturedSection';
import SuggestedSection from './SuggestedSection';

type Props = {
  queryRef: FeaturedFragment$key;
};

export default function Featured({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment FeaturedFragment on Query {
        trendingUsers5Days: trendingUsers(input: { report: LAST_5_DAYS }) {
          ... on TrendingUsersPayload {
            __typename
            ...FeaturedSectionFragment
          }
        }
        trendingUsersAllTime: trendingUsers(input: { report: ALL_TIME }) {
          ... on TrendingUsersPayload {
            __typename
            ...FeaturedSectionFragment
          }
        }

        viewer {
          __typename
        }

        ...FeaturedSectionQueryFragment
        ...SuggestedSectionQueryFragment
      }
    `,
    queryRef
  );

  return (
    <StyledFeaturedPage gap={48}>
      {query.viewer?.__typename == 'Viewer' && (
        <SuggestedSection
          title="Suggested for you"
          subTitle="Curators you may be interested in based on who you follow on Gallery"
          queryRef={query}
        />
      )}
      {query.trendingUsers5Days?.__typename === 'TrendingUsersPayload' && (
        <FeaturedSection
          title="Weekly Leaderboard"
          subTitle="Trending curators this week"
          trendingUsersRef={query.trendingUsers5Days}
          queryRef={query}
        />
      )}
      {query.trendingUsersAllTime?.__typename === 'TrendingUsersPayload' && (
        <FeaturedSection
          title="Hall of Fame"
          subTitle="Top curators with the most all-time views"
          trendingUsersRef={query.trendingUsersAllTime}
          queryRef={query}
        />
      )}
    </StyledFeaturedPage>
  );
}

const StyledFeaturedPage = styled(VStack)`
  width: 100%;
  flex: 1;
  padding: 16px 0;
`;
