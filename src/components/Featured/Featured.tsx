import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { FeaturedFragment$key } from '~/generated/FeaturedFragment.graphql';

import { VStack } from '../core/Spacer/Stack';
import FeaturedSection from './FeaturedSection';

type Props = {
  queryRef: FeaturedFragment$key;
};

export default function Featured({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment FeaturedFragment on Query {
        trendingUsers7Days: trendingUsers(input: { report: LAST_7_DAYS }) {
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

        ...FeaturedSectionQueryFragment
      }
    `,
    queryRef
  );

  return (
    <StyledFeaturedPage gap={48}>
      {query.trendingUsers7Days?.__typename === 'TrendingUsersPayload' && (
        <FeaturedSection
          title="Weekly Leaderboard"
          subTitle="Trending curators this week"
          trendingUsersRef={query.trendingUsers7Days}
          queryRef={query}
        />
      )}
      {query.trendingUsersAllTime?.__typename === 'TrendingUsersPayload' && (
        <FeaturedSection
          title="Hall of Fame"
          subTitle="Top collectors with the most all-time views"
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
