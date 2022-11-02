import GalleryLeftContent from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryLeftContent';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { GalleryNavbarFragment$key } from '../../../../../__generated__/GalleryNavbarFragment.graphql';
import { GalleryRightContent } from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryRightContent';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from 'contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { HStack, VStack } from 'components/core/Spacer/Stack';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import { GalleryNavLinks } from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavLinks';
import { BreadcrumbLink } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';
import styled, { css } from 'styled-components';
import { isUsername3ac } from 'hooks/oneOffs/useIs3acProfilePage';
import FollowButton from 'components/Follow/FollowButton';
import { route, Route } from 'nextjs-routes';
import Link from 'next/link';
import { Suspense } from 'react';
import colors from 'components/core/colors';
import { useRouter } from 'next/router';

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
        ...GalleryNavLinksFragment
        ...FollowButtonQueryFragment

        userByUsername(username: $username) {
          ...FollowButtonUserFragment
        }
      }
    `,
    queryRef
  );

  const is3ac = isUsername3ac(username);
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
                  {is3ac ? 'The Unofficial 3AC Gallery' : username}
                </UsernameBreadcrumbLink>
              </Link>
              {query.userByUsername && (
                <Suspense fallback={null}>
                  <FollowButton queryRef={query} userRef={query.userByUsername} />
                </Suspense>
              )}
            </HStack>
          ) : (
            <GalleryNavLinks username={username} queryRef={query} />
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
            <GalleryNavLinks username={username} queryRef={query} />
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
