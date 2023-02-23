import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { FeaturedFragment$key } from '~/generated/FeaturedFragment.graphql';

import { VStack } from '../core/Spacer/Stack';
import SuggestedSection from './SuggestedSection';
import TrendingSection from './TrendingSection';

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
        }

        ...TrendingSectionQueryFragment
        ...SuggestedSectionQueryFragment
      }
    `,
    queryRef
  );

  return (
    <StyledFeaturedPage gap={48}>
      {query.viewer?.__typename === 'Viewer' && (
        <SuggestedSection
          title="In your orbit"
          subTitle="Curators you may enjoy based on your activity"
          queryRef={query}
        />
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
    </StyledFeaturedPage>
  );
}

const StyledFeaturedPage = styled(VStack)`
  width: 100%;
  flex: 1;
  padding: 16px 0;
`;
