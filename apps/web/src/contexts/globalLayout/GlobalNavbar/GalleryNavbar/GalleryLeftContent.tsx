import { Route, route } from 'nextjs-routes';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { HStack } from '~/components/core/Spacer/Stack';
import NavActionFollow from '~/components/Follow/NavActionFollow';
import {
  BreadcrumbLink,
  BreadcrumbText,
} from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';
import { GalleryLeftContentFragment$key } from '~/generated/GalleryLeftContentFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import colors from '~/shared/theme/colors';

type Props = {
  galleryName: string | null;
  queryRef: GalleryLeftContentFragment$key;
};

export default function GalleryLeftContent({ queryRef, galleryName }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryLeftContentFragment on Query {
        ...NavActionFollowQueryFragment

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
    } else if (galleryName && query.userByUsername?.username) {
      const usernameRoute: Route = {
        pathname: '/[username]',
        query: { username: query.userByUsername.username },
      };

      return (
        <HStack gap={4} align="center">
          <GalleryLink to={usernameRoute}>
            <UsernameBreadcrumbLink href={route(usernameRoute)}>
              {query.userByUsername?.username}
            </UsernameBreadcrumbLink>
          </GalleryLink>
          <BreadcrumbText>/ {galleryName || 'Untitled'}</BreadcrumbText>
        </HStack>
      );
    } else if (user) {
      return <NavActionFollow userRef={user} queryRef={query} />;
    } else {
      return null;
    }
  }, [galleryName, isMobile, query, user]);

  return (
    <Wrapper gap={4} align="center">
      {rightContent}
    </Wrapper>
  );
}

const UsernameBreadcrumbLink = styled(BreadcrumbLink)`
  color: ${colors.shadow};
`;

const Wrapper = styled(HStack)`
  position: relative;
  max-width: 100%;
`;
