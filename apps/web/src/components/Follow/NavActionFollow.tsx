import { useRouter } from 'next/router';
import { Route, route } from 'nextjs-routes';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BreadcrumbLink } from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';
import { NavActionFollowQueryFragment$key } from '~/generated/NavActionFollowQueryFragment.graphql';
import { NavActionFollowUserFragment$key } from '~/generated/NavActionFollowUserFragment.graphql';
import colors from '~/shared/theme/colors';
import handleCustomDisplayName from '~/utils/handleCustomDisplayName';

import GalleryLink from '../core/GalleryLink/GalleryLink';
import FollowButton from './FollowButton';

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
  const { pathname } = useRouter();
  const { username } = user;
  if (!username) {
    return null;
  }

  const displayName = handleCustomDisplayName(username);

  const usernameRoute: Route = { pathname: '/[username]', query: { username: username } };

  return (
    <HStack gap={8} align="center">
      <GalleryLink to={usernameRoute}>
        <UsernameBreadcrumbLink
          href={route(usernameRoute)}
          mainGalleryPage={pathname === '/[username]'}
        >
          {displayName}
        </UsernameBreadcrumbLink>
      </GalleryLink>
      <FollowButton queryRef={loggedInUserQuery} userRef={user} source="navbar desktop" />
    </HStack>
  );
}

const UsernameBreadcrumbLink = styled(BreadcrumbLink)<{ mainGalleryPage: boolean }>`
  color: ${({ mainGalleryPage }) => (mainGalleryPage ? colors.black['800'] : colors.shadow)};
`;
