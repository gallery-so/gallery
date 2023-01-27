import Link from 'next/link';
import { Route, route } from 'nextjs-routes';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { HStack } from '~/components/core/Spacer/Stack';
import NavActionFollow from '~/components/Follow/NavActionFollow';
import {
  BreadcrumbLink,
  BreadcrumbText,
} from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';
import { ProfileDropdown } from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/ProfileDropdown';
import { GalleryLeftContentFragment$key } from '~/generated/GalleryLeftContentFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';

type Props = {
  galleryName: string | null;
  queryRef: GalleryLeftContentFragment$key;
};

export default function GalleryLeftContent({ queryRef, galleryName }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryLeftContentFragment on Query {
        ...NavActionFollowQueryFragment
        ...ProfileDropdownFragment

        userByUsername(username: $username) {
          ... on GalleryUser {
            username
          }
          ...NavActionFollowUserFragment
        }
      }
    `,
    queryRef
  );

  const user = query.userByUsername;

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const rightContent = useMemo(() => {
    if (isMobile) {
      return null;
    } else if (query.userByUsername?.username) {
      const usernameRoute: Route = {
        pathname: '/[username]',
        query: { username: query.userByUsername.username },
      };

      return (
        <HStack gap={4} align="center">
          <Link href={usernameRoute}>
            <UsernameBreadcrumbLink href={route(usernameRoute)}>
              {query.userByUsername?.username}
            </UsernameBreadcrumbLink>
          </Link>
          <BreadcrumbText>/ {galleryName || 'Untitled'}</BreadcrumbText>
        </HStack>
      );
    } else if (user) {
      return <NavActionFollow userRef={user} queryRef={query} />;
    } else {
      return null;
    }
  }, [galleryName, isMobile, query, user]);

  return <ProfileDropdown queryRef={query} rightContent={rightContent} />;
}

const UsernameBreadcrumbLink = styled(BreadcrumbLink)`
  color: ${colors.shadow};
`;
