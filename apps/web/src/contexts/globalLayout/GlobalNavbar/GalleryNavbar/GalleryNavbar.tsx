import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { VStack } from '~/components/core/Spacer/Stack';
import GalleryLeftContent from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryLeftContent';
import { GalleryNavLinks } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavLinks';
import { GalleryRightContent } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryRightContent';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from '~/contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { GalleryNavbarFragment$key } from '~/generated/GalleryNavbarFragment.graphql';
import { GalleryNavbarGalleryFragment$key } from '~/generated/GalleryNavbarGalleryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';

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

        userByUsername(username: $username) @required(action: THROW) {
          ...GalleryNavLinksFragment
          ...GalleryNavLinksPaginationFragment
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

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

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
          {!isMobile && (
            <GalleryNavLinks
              username={username}
              queryRef={query.userByUsername}
              postsQueryRef={query.userByUsername}
            />
          )}
        </NavbarCenterContent>

        <NavbarRightContent>
          <GalleryRightContent galleryRef={gallery} username={username} queryRef={query} />
        </NavbarRightContent>
      </StandardNavbarContainer>
    </VStack>
  );
}
