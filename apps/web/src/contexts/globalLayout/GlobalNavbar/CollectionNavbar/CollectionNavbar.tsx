import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { HStack } from '~/components/core/Spacer/Stack';
import { Paragraph, TITLE_FONT_FAMILY } from '~/components/core/Text/Text';
import NavActionFollow from '~/components/Follow/NavActionFollow';
import { CollectionRightContent } from '~/contexts/globalLayout/GlobalNavbar/CollectionNavbar/CollectionRightContent';
import { GalleryNavLinks } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavLinks';
import {
  BreadcrumbLink,
  BreadcrumbText,
} from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';
import { CollectionNavbarFragment$key } from '~/generated/CollectionNavbarFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';

import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from '../StandardNavbarContainer';

type CollectionNavbarProps = {
  username: string;
  collectionId: string;
  queryRef: CollectionNavbarFragment$key;
};

export function CollectionNavbar({ queryRef, username, collectionId }: CollectionNavbarProps) {
  const query = useFragment(
    graphql`
      fragment CollectionNavbarFragment on Query {
        ...CollectionRightContentFragment
        ...NavActionFollowQueryFragment
        ...GalleryNavLinksQueryFragment

        userByUsername(username: $username) @required(action: THROW) {
          ...GalleryNavLinksFragment
          ...NavActionFollowUserFragment
        }

        collectionById(id: $collectionId) {
          ... on Collection {
            __typename
            name

            gallery @required(action: THROW) {
              dbid
              name
            }
          }
        }
      }
    `,
    queryRef
  );

  if (query.collectionById?.__typename !== 'Collection') {
    throw new Error('Expected collectionById to be a Collection');
  }

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const galleryRoute: Route = {
    pathname: '/[username]/galleries/[galleryId]',
    query: { username, galleryId: query.collectionById?.gallery.dbid },
  };

  const unescapedCollectionName = useMemo(() => {
    if (query.collectionById?.__typename === 'Collection') {
      return query.collectionById?.name || 'untitled';
    }

    return 'untitled';
  }, [query.collectionById]);

  const galleryName = query.collectionById.gallery.name?.trim() || 'Untitled';

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent>
        {isMobile ? null : (
          <StyledBreadCrumbs gap={4} shrink align="center">
            {query.userByUsername && (
              <NavActionFollow userRef={query.userByUsername} queryRef={query} />
            )}

            <SlashText>/</SlashText>

            <GalleryLink
              to={galleryRoute}
              eventElementId="Gallery Name Link"
              eventName="Gallery Name Link Click"
              eventContext={contexts.UserGallery}
            >
              <BreadcrumbLink>{galleryName}</BreadcrumbLink>
            </GalleryLink>

            <SlashText>/</SlashText>

            <CollectionNameText title={unescapedCollectionName}>
              {unescapedCollectionName}
            </CollectionNameText>
          </StyledBreadCrumbs>
        )}
      </NavbarLeftContent>

      <NavbarCenterContent>
        {!isMobile && (
          <GalleryNavLinks username={username} userRef={query.userByUsername} queryRef={query} />
        )}
      </NavbarCenterContent>

      <NavbarRightContent>
        <CollectionRightContent collectionId={collectionId} username={username} queryRef={query} />
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}

const StyledBreadCrumbs = styled(HStack)`
  position: relative;
  max-width: 100%;

  ${BreadcrumbLink} {
    color: ${colors.shadow};
  }
`;
const CollectionNameText = styled(BreadcrumbText)`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SlashText = styled(Paragraph)`
  font-family: ${TITLE_FONT_FAMILY};
  font-size: 18px;
  font-weight: 300;
  line-height: 21px;
`;
