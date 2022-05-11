import Spacer from 'components/core/Spacer/Spacer';
import { useLoggedInUserId } from 'hooks/useLoggedInUserId';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import FollowButton from './FollowButton';
import FollowerCount from './FollowerCount';

type Props = {
  userRef: any;
  queryRef: any;
};

//
// TODO
// dont show navbar actions if signed out - OR NOT, ASK JESS
// format markdown for bio
// test extreme cases, consider virtualizing list

// questions
// how to format bio - with markdown, new lines, etc
// blank state with 0 followers
// behavior when signed out: disabled, like when you view your own gallery? or have follow up button and prompt sign in?
// or disabled + if you hover, it shows "please sign in to follow"

// rename to NavActionFollow
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

  const query = useFragment(
    graphql`
      fragment NavActionFollowQueryFragment on Query {
        ...useLoggedInUserIdFragment
      }
    `,
    queryRef
  );

  const loggedInUserId = useLoggedInUserId(query);

  const isAuthenticatedUsersPage = loggedInUserId === user?.id;

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
      <FollowButton userRef={user} isFollowing={isFollowing} disabled={isAuthenticatedUsersPage} />
      <Spacer width={4} />
      <FollowerCount userRef={user}></FollowerCount>
    </StyledNavActionFollow>
  );
}

const StyledNavActionFollow = styled.div`
  display: flex;
  align-items: center;
`;
