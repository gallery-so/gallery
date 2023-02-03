import Link from 'next/link';
import { Route, route } from 'nextjs-routes';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { Paragraph, TITLE_FONT_FAMILY } from '~/components/core/Text/Text';
import NavActionFollow from '~/components/Follow/NavActionFollow';
import { CollectionRightContent } from '~/contexts/globalLayout/GlobalNavbar/CollectionNavbar/CollectionRightContent';
import { GalleryNavLinks } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavLinks';
import {
  BreadcrumbLink,
  BreadcrumbText,
} from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';
import {
  ProfileDropdown,
  SlashText,
} from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/ProfileDropdown';
import { CollectionNavbarFragment$key } from '~/generated/CollectionNavbarFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import unescape from '~/utils/unescape';

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
        ...ProfileDropdownFragment
        ...NavActionFollowQueryFragment

        userByUsername(username: $username) {
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

  const usernameRoute: Route = { pathname: '/[username]', query: { username } };

  const galleryRoute: Route = {
    pathname: '/[username]/galleries/[galleryId]',
    query: { username, galleryId: query.collectionById?.gallery.dbid },
  };

  const unescapedCollectionName = useMemo(() => {
    if (query.collectionById?.__typename === 'Collection') {
      return unescape(query.collectionById?.name ?? '') || 'untitled';
    }

    return 'untitled';
  }, [query.collectionById]);

  const galleryName = query.collectionById.gallery.name || 'Untitled';

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent>
        <ProfileDropdown
          queryRef={query}
          rightContent={
            isMobile ? null : (
              <RightContentWrapper shrink gap={4}>
                {query.userByUsername && (
                  <NavActionFollow userRef={query.userByUsername} queryRef={query} />
                )}

                <SlashText>/</SlashText>

                <Link href={galleryRoute}>
                  <BreadcrumbLink href={route(galleryRoute)}>{galleryName}</BreadcrumbLink>
                </Link>

                <SlashText>/</SlashText>

                <CollectionNameText title={unescapedCollectionName}>
                  {unescapedCollectionName}
                </CollectionNameText>
              </RightContentWrapper>
            )
          }
        />
      </NavbarLeftContent>

      <NavbarCenterContent>
        {isMobile ? (
          <VStack align="center" shrink>
            <Link href={usernameRoute}>
              <MobileUsernameText>{username}</MobileUsernameText>
            </Link>
            <BreadcrumbText>{unescapedCollectionName}</BreadcrumbText>
          </VStack>
        ) : (
          <GalleryNavLinks username={username} />
        )}
      </NavbarCenterContent>

      <NavbarRightContent>
        <CollectionRightContent collectionId={collectionId} username={username} queryRef={query} />
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}
const CollectionNameText = styled(BreadcrumbText)`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RightContentWrapper = styled(HStack)`
  ${BreadcrumbLink} {
    color: ${colors.shadow};
  }
`;

const MobileUsernameText = styled(Paragraph)`
  font-family: ${TITLE_FONT_FAMILY};
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
  letter-spacing: -0.04em;

  color: ${colors.shadow};
`;
