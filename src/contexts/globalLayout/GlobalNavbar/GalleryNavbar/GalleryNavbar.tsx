import Link from 'next/link';
import { useRouter } from 'next/router';
import { Route, route } from 'nextjs-routes';
import { Suspense } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled, { css } from 'styled-components';

import colors from '~/components/core/colors';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import FollowButton from '~/components/Follow/FollowButton';
import GalleryLeftContent from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryLeftContent';
import { GalleryNavLinks } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavLinks';
import { GalleryRightContent } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryRightContent';
import { BreadcrumbLink } from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from '~/contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { GalleryNavbarFragment$key } from '~/generated/GalleryNavbarFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import handleCustomDisplayName from '~/utils/handleCustomDisplayName';

type Props = {
  username: string;
  queryRef: GalleryNavbarFragment$key;
};

export function GalleryNavbar({ queryRef, username }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryNavbarFragment on Query {
        ...GalleryLeftContentFragment
        ...GalleryRightContentFragment
        ...FollowButtonQueryFragment

        userByUsername(username: $username) {
          ...FollowButtonUserFragment
        }
      }
    `,
    queryRef
  );

  const displayName = handleCustomDisplayName(username);
  const isMobile = useIsMobileOrMobileLargeWindowWidth();
  const { pathname } = useRouter();

  const userGalleryRoute: Route = { pathname: '/[username]', query: { username } };

  return (
    <VStack>
      <StandardNavbarContainer>
        <NavbarLeftContent>
          <GalleryLeftContent queryRef={query} />
        </NavbarLeftContent>
        <NavbarCenterContent>
          {isMobile ? (
            <HStack gap={4}>
              <Link href={userGalleryRoute}>
                <UsernameBreadcrumbLink
                  mainGalleryPage={pathname === '/[username]'}
                  href={route(userGalleryRoute)}
                >
                  {displayName}
                </UsernameBreadcrumbLink>
              </Link>
              {query.userByUsername && (
                <Suspense fallback={null}>
                  <FollowButton queryRef={query} userRef={query.userByUsername} />
                </Suspense>
              )}
            </HStack>
          ) : (
            <GalleryNavLinks username={username} />
          )}
        </NavbarCenterContent>
        <NavbarRightContent>
          <GalleryRightContent username={username} queryRef={query} />
        </NavbarRightContent>
      </StandardNavbarContainer>

      {/* This is the next row for mobile content */}
      {isMobile && (
        <StandardNavbarContainer>
          <MobileNavLinks justify="center" grow>
            <GalleryNavLinks username={username} />
          </MobileNavLinks>
        </StandardNavbarContainer>
      )}
    </VStack>
  );
}

const UsernameBreadcrumbLink = styled(BreadcrumbLink)<{ mainGalleryPage: boolean }>`
  ${({ mainGalleryPage }) =>
    mainGalleryPage
      ? css`
          color: ${colors.offBlack};
        `
      : css`
          color: ${colors.shadow};
        `};
`;

const MobileNavLinks = styled(HStack)`
  padding: 4px 0 16px 0;
  border-bottom: 1px solid #e7e7e7;
`;
