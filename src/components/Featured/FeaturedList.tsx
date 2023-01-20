import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { FeaturedListFragment$key } from '~/generated/FeaturedListFragment.graphql';
import { FeaturedUserCardFollowFragment$key } from '~/generated/FeaturedUserCardFollowFragment.graphql';

import breakpoints from '../core/breakpoints';
import { HStack } from '../core/Spacer/Stack';
import FeaturedUserCard from './FeaturedUserCard';

type Props = {
  trendingUsersRef: FeaturedListFragment$key;
  queryRef: FeaturedUserCardFollowFragment$key;
};

const USERS_TO_SHOW = 16;

export default function FeaturedList({ trendingUsersRef, queryRef }: Props) {
  const trendingUsers = useFragment(
    graphql`
      fragment FeaturedListFragment on TrendingUsersPayload {
        users {
          id
          ...FeaturedUserCardFragment
        }
      }
    `,
    trendingUsersRef
  );

  const shortenedUserList = useMemo(() => {
    const users = trendingUsers.users ?? [];
    return users.slice(0, USERS_TO_SHOW);
  }, [trendingUsers.users]);

  return (
    <StyledFeaturedList>
      <Wrapper>
        {shortenedUserList.map((user) => (
          <FeaturedUserCard userRef={user} queryRef={queryRef} key={user.id} />
        ))}
      </Wrapper>
    </StyledFeaturedList>
  );
}

const StyledFeaturedList = styled(HStack)`
  gap: 12px 16px;
  overflow-x: scroll;
  padding-bottom: 16px; // to create space for overflow scroll bar
`;

const Wrapper = styled.div`
  display: grid;

  grid-template-columns: repeat(8, 1fr);

  grid-gap: 12px 16px;
  min-width: 1496px; // define the full width of the list, which is meant to overflow and be horizontally scrollable

  @media only screen and ${breakpoints.desktop} {
    min-width: 2560px;
  }
`;
