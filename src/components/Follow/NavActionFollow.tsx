import { HStack } from 'components/core/Spacer/Stack';
import { useLoggedInUserId } from 'hooks/useLoggedInUserId';
import { graphql, useFragment } from 'react-relay';
import { NavActionFollowQueryFragment$key } from '__generated__/NavActionFollowQueryFragment.graphql';
import { NavActionFollowUserFragment$key } from '__generated__/NavActionFollowUserFragment.graphql';
import FollowButton from './FollowButton';
import { BreadcrumbText } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';

type Props = {
  userRef: NavActionFollowUserFragment$key;
  queryRef: NavActionFollowQueryFragment$key;
};

export default function NavActionFollow({ userRef, queryRef }: Props) {
  const user = useFragment(
    graphql`
      fragment NavActionFollowUserFragment on GalleryUser {
        username

        ...FollowButtonUserFragment
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
    <HStack gap={8} align="center">
      <BreadcrumbText>{user.username}</BreadcrumbText>
      {isLoggedIn ? <FollowButton queryRef={loggedInUserQuery} userRef={user} /> : null}
    </HStack>
  );
}
