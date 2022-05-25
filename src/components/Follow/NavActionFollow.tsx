import Spacer from 'components/core/Spacer/Spacer';
import { useLoggedInUserId } from 'hooks/useLoggedInUserId';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { NavActionFollowFragment$key } from '__generated__/NavActionFollowFragment.graphql';
import { NavActionFollowQueryFragment$key } from '__generated__/NavActionFollowQueryFragment.graphql';
import FollowButton from './FollowButton';
import FollowerCount from './FollowerCount';

type Props = {
  userRef: NavActionFollowFragment$key;
  queryRef: NavActionFollowQueryFragment$key;
};

export default function NavActionFollow({ userRef, queryRef }: Props) {
  const user = useFragment(
    graphql`
      fragment NavActionFollowFragment on GalleryUser {
        id
        followers {
          id
        }
        ...FollowerCountFragment
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

  const followerIds = useMemo(
    () => user.followers.map((follower: { id: string }) => follower.id),
    [user.followers]
  );

  const isFollowing = useMemo(
    () => followerIds.indexOf(loggedInUserId) > -1,
    [followerIds, loggedInUserId]
  );

  return (
    <StyledNavActionFollow>
      <FollowButton userRef={user} isFollowing={isFollowing} loggedInUserId={loggedInUserId} />
      <Spacer width={4} />
      <FollowerCount userRef={user}></FollowerCount>
    </StyledNavActionFollow>
  );
}

const StyledNavActionFollow = styled.div`
  display: flex;
  align-items: center;
`;
