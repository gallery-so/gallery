import { HStack } from 'components/core/Spacer/Stack';
import { graphql, useFragment } from 'react-relay';
import { NavActionFollowQueryFragment$key } from '__generated__/NavActionFollowQueryFragment.graphql';
import { NavActionFollowUserFragment$key } from '__generated__/NavActionFollowUserFragment.graphql';
import FollowButton from './FollowButton';
import { BreadcrumbLink } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';
import { route, Route } from 'nextjs-routes';
import Link from 'next/link';
import { isUsername3ac } from 'hooks/oneOffs/useIs3acProfilePage';

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
      }
    `,
    queryRef
  );

  if (!user.username) {
    return null;
  }

  const is3ac = isUsername3ac(user.username);
  const usernameRoute: Route = { pathname: '/[username]', query: { username: user.username } };

  return (
    <HStack gap={8} align="center">
      <Link href={usernameRoute}>
        <BreadcrumbLink href={route(usernameRoute)}>
          {is3ac ? 'The Unofficial 3AC Gallery' : user.username}
        </BreadcrumbLink>
      </Link>
      <FollowButton queryRef={loggedInUserQuery} userRef={user} />
    </HStack>
  );
}
