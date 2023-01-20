import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { FeaturedFragment$key } from '~/generated/FeaturedFragment.graphql';

import breakpoints from '../core/breakpoints';
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
            # eslint-disable-next-line relay/must-colocate-fragment-spreads
            ...FeaturedListFragment
          }
        }
        trendingUsersAllTime: trendingUsers(input: { report: ALL_TIME }) {
          ... on TrendingUsersPayload {
            __typename
            # eslint-disable-next-line relay/must-colocate-fragment-spreads
            ...FeaturedListFragment
          }
        }
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...FeaturedUserCardFollowFragment
      }
    `,
    queryRef
  );

  return (
    <StyledFeaturedPage gap={64}>
      {query.trendingUsers7Days?.__typename === 'TrendingUsersPayload' && (
        <FeaturedSection
          title="Weekly Spotlight"
          subTitle="Top collectors with the most views in the past week"
          trendingUsersRef={query.trendingUsers7Days}
          queryRef={query}
        />
      )}
      {query.trendingUsersAllTime?.__typename === 'TrendingUsersPayload' && (
        <FeaturedSection
          title="Most popular"
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
  padding: 24px 0;
`;
