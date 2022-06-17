import Spacer from 'components/core/Spacer/Spacer';
import { useLoggedInUserId } from 'hooks/useLoggedInUserId';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { NavActionFollowQueryFragment$key } from '__generated__/NavActionFollowQueryFragment.graphql';
import { NavActionFollowUserFragment$key } from '__generated__/NavActionFollowUserFragment.graphql';
import FollowButton from './FollowButton';
import FollowerListButton, { StyledFollowerListButton } from './FollowerListButton';

type Props = {
  userRef: NavActionFollowUserFragment$key;
  queryRef: NavActionFollowQueryFragment$key;
};

export default function NavActionFollow({ userRef, queryRef }: Props) {
  const user = useFragment(
    graphql`
      fragment NavActionFollowUserFragment on GalleryUser {
        id
        followers @required(action: THROW) {
          id @required(action: THROW)
        }
        ...FollowerListButtonFragment
        ...FollowButtonFragment
      }
    `,
    userRef
  );

  const loggedInUserQuery = useFragment(
    graphql`
      fragment NavActionFollowQueryFragment on Query {
        ...useLoggedInUserIdFragment
      }
    `,
    queryRef
  );

  const loggedInUserId = useLoggedInUserId(loggedInUserQuery);
  const isLoggedIn = !!loggedInUserId;

  const followerIds = useMemo(
    () => user.followers.map((follower: { id: string } | null) => follower?.id),
    [user.followers]
  );

  const isFollowing = useMemo(
    () => !!loggedInUserId && followerIds.indexOf(loggedInUserId) > -1,
    [followerIds, loggedInUserId]
  );

  return (
    <StyledNavActionFollow isLoggedIn={isLoggedIn}>
      {isLoggedIn ? (
        <>
          <FollowButton userRef={user} isFollowing={isFollowing} loggedInUserId={loggedInUserId} />
          <Spacer width={4} />
        </>
      ) : null}
      <FollowerListButton userRef={user}></FollowerListButton>
    </StyledNavActionFollow>
  );
}

const StyledNavActionFollow = styled.div<{ isLoggedIn: boolean }>`
  display: flex;
  align-items: center;

  ${({ isLoggedIn }) =>
    isLoggedIn &&
    `
    ${StyledFollowerListButton} {
      opacity: 0;
    }
  `}

  &:hover {
    ${StyledFollowerListButton} {
      opacity: 1;
    }
  }
`;
