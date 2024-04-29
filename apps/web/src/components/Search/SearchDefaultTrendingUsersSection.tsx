import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { SearchDefaultTrendingUsersSectionFragment$key } from '~/generated/SearchDefaultTrendingUsersSectionFragment.graphql';

import { fadeIn } from '../core/keyframes';
import { HStack, VStack } from '../core/Spacer/Stack';
import SuggestedProfileCard from '../Feed/SuggestedProfileCard';
import SearchResultsHeader from './SearchResultsHeader';
import { SearchItemType } from './types';

type Props = {
  queryRef: SearchDefaultTrendingUsersSectionFragment$key;
  variant?: 'default' | 'compact';
  onSelect: (item: SearchItemType) => void;
};

export default function SearchDefaultTrendingUsersSection({ queryRef, variant, onSelect }: Props) {
  const query = useFragment(
    graphql`
      fragment SearchDefaultTrendingUsersSectionFragment on Query {
        trendingUsers5Days: trendingUsers(input: { report: LAST_5_DAYS }) {
          ... on TrendingUsersPayload {
            __typename
            users {
              username
              dbid
              ...SuggestedProfileCardFragment
            }
          }
        }

        ...SuggestedProfileCardFollowFragment
      }
    `,
    queryRef
  );

  if (query.trendingUsers5Days?.__typename !== 'TrendingUsersPayload') {
    return null;
  }

  const { users: trendingUsers } = query.trendingUsers5Days;

  return (
    <StyledWrapper gap={8}>
      <HeaderWrapper>
        <SearchResultsHeader variant={variant}>
          Trending collectors and creators
        </SearchResultsHeader>
      </HeaderWrapper>
      <HStack gap={4}>
        {trendingUsers?.slice(0, 2)?.map((profile) => (
          <SuggestedProfileCard
            key={profile.dbid}
            userRef={profile}
            queryRef={query}
            onClick={() =>
              onSelect({
                type: 'User' as const,
                label: profile.username ?? '',
                value: profile.dbid,
              })
            }
            showFollowButton={false}
          />
        ))}
      </HStack>
    </StyledWrapper>
  );
}

const HeaderWrapper = styled(HStack)`
  padding: 0px 12px;

  @media only screen and ${breakpoints.desktop} {
    padding-right: 12px;
    padding-left: 8px;
  }
`;

const StyledWrapper = styled(VStack)`
  animation: ${fadeIn} 0.2s ease-out forwards;
`;
