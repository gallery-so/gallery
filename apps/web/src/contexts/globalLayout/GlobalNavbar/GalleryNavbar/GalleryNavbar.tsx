import Link from 'next/link';
import { useRouter } from 'next/router';
import { Route, route } from 'nextjs-routes';
import { Suspense, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled, { css } from 'styled-components';

import colors from '~/components/core/colors';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import FollowButton from '~/components/Follow/FollowButton';
import GalleryLeftContent from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryLeftContent';
import { GalleryNavLinks } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavLinks';
import { GalleryRightContent } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryRightContent';
import {
  BreadcrumbLink,
  BreadcrumbText,
} from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from '~/contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { GalleryNavbarFragment$key } from '~/generated/GalleryNavbarFragment.graphql';
import { GalleryNavbarGalleryFragment$key } from '~/generated/GalleryNavbarGalleryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import handleCustomDisplayName from '~/utils/handleCustomDisplayName';

type Props = {
  username: string;
  showGalleryNameBreadcrumb?: boolean;
  galleryRef: GalleryNavbarGalleryFragment$key | null;
  queryRef: GalleryNavbarFragment$key;
};

export function GalleryNavbar({
  queryRef,
  username,
  galleryRef,
  showGalleryNameBreadcrumb,
}: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryNavbarFragment on Query {
        ...GalleryLeftContentFragment
        ...GalleryRightContentFragment
        ...FollowButtonQueryFragment

        userByUsername(username: $username) @required(action: THROW) {
          ...GalleryNavLinksFragment
          ...FollowButtonUserFragment
        }
      }
    `,
    queryRef
  );

  const gallery = useFragment(
    graphql`
      fragment GalleryNavbarGalleryFragment on Gallery {
        name

        ...GalleryRightContentGalleryFragment
      }
    `,
    galleryRef
  );

  const displayName = handleCustomDisplayName(username);
  const isMobile = useIsMobileOrMobileLargeWindowWidth();
  const { pathname } = useRouter();

  const userGalleryRoute: Route = { pathname: '/[username]', query: { username } };

  const displayGalleryName = useMemo(() => {
    if (!showGalleryNameBreadcrumb) {
      return null;
    }

    return gallery?.name ?? null;
  }, [gallery?.name, showGalleryNameBreadcrumb]);

  return (
    <VStack>
      <StandardNavbarContainer>
        <NavbarLeftContent>
          <GalleryLeftContent galleryName={displayGalleryName} queryRef={query} />
        </NavbarLeftContent>

        <NavbarCenterContent>
          {isMobile ? (
            <HStack style={{ overflow: 'hidden' }} gap={4}>
              <Link href={userGalleryRoute} legacyBehavior>
                <UsernameBreadcrumbLink
                  href={route(userGalleryRoute)}
                  mainGalleryPage={pathname === '/[username]'}
                >
                  {displayName}{' '}
                  {displayGalleryName && <BreadcrumbText>/ {displayGalleryName}</BreadcrumbText>}
                </UsernameBreadcrumbLink>
              </Link>

              {!displayGalleryName && (
                <>
                  {query.userByUsername && (
                    <Suspense fallback={null}>
                      <FollowButton
                        queryRef={query}
                        userRef={query.userByUsername}
                        source="navbar mobile"
                      />
                    </Suspense>
                  )}
                </>
              )}
            </HStack>
          ) : (
            <GalleryNavLinks username={username} queryRef={query.userByUsername} />
          )}
        </NavbarCenterContent>

        <NavbarRightContent>
          <GalleryRightContent galleryRef={gallery} username={username} queryRef={query} />
        </NavbarRightContent>
      </StandardNavbarContainer>

      {/* This is the next row for mobile content */}
      {isMobile && (
        <StandardNavbarContainer>
          <MobileNavLinks justify="center" grow>
            <GalleryNavLinks username={username} queryRef={query.userByUsername} />
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
