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
import styled from 'styled-components';
import { isUsername3ac } from 'hooks/oneOffs/useIs3acProfilePage';
import FollowButton from 'components/Follow/FollowButton';
import { route, Route } from 'nextjs-routes';
import Link from 'next/link';

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

        viewer {
          ... on Viewer {
            __typename
          }
        }
        userByUsername(username: $username) {
          ...FollowButtonUserFragment
        }
      }
    `,
    queryRef
  );

  const isLoggedIn = query.viewer?.__typename === 'Viewer';
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const is3ac = isUsername3ac(username);

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
                <BreadcrumbLink href={route(userGalleryRoute)}>
                  {is3ac ? 'The Unofficial 3AC Gallery' : username}
                </BreadcrumbLink>
              </Link>
              {query.userByUsername && isLoggedIn && (
                <FollowButton queryRef={query} userRef={query.userByUsername} />
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

const MobileNavLinks = styled(HStack)`
  padding: 4px 0 16px 0;
  border-bottom: 1px solid #e7e7e7;
`;
