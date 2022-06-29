import Spacer from 'components/core/Spacer/Spacer';
import { useLoggedInUserId } from 'hooks/useLoggedInUserId';
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
        ...FollowButtonUserFragment
        ...FollowerListButtonFragment
      }
    `,
    userRef
  );

  const loggedInUserQuery = useFragment(
    graphql`
      fragment NavActionFollowQueryFragment on Query {
        ...FollowButtonQueryFragment
        ...useLoggedInUserIdFragment
      }
    `,
    queryRef
  );

  const loggedInUserId = useLoggedInUserId(loggedInUserQuery);
  const isLoggedIn = !!loggedInUserId;

  return (
    <StyledNavActionFollow isLoggedIn={isLoggedIn}>
      {isLoggedIn ? (
        <>
          <FollowButton queryRef={loggedInUserQuery} userRef={user} />
          <Spacer width={4} />
        </>
      ) : null}
      <FollowerListButton userRef={user} />
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
