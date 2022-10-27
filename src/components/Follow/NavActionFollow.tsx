import { HStack } from 'components/core/Spacer/Stack';
import { useLoggedInUserId } from 'hooks/useLoggedInUserId';
import { graphql, useFragment } from 'react-relay';
import { NavActionFollowQueryFragment$key } from '__generated__/NavActionFollowQueryFragment.graphql';
import { NavActionFollowUserFragment$key } from '__generated__/NavActionFollowUserFragment.graphql';
import FollowButton from './FollowButton';
import { BreadcrumbLink } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';
import { route, Route } from 'nextjs-routes';
import Link from 'next/link';

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

  if (!user.username) {
    return null;
  }

  const usernameRoute: Route = { pathname: '/[username]', query: { username: user.username } };

  return (
    <HStack gap={8} align="center">
      <Link href={usernameRoute}>
        <BreadcrumbLink href={route(usernameRoute)}>{user.username}</BreadcrumbLink>
      </Link>
      {isLoggedIn ? <FollowButton queryRef={loggedInUserQuery} userRef={user} /> : null}
    </HStack>
  );
}
