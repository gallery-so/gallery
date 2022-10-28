import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CollectionNavbarFragment$key } from '__generated__/CollectionNavbarFragment.graphql';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from '../StandardNavbarContainer';
import {
  BreadcrumbLink,
  BreadcrumbText,
} from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';
import { CollectionRightContent } from 'contexts/globalLayout/GlobalNavbar/CollectionNavbar/CollectionRightContent';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import { HStack, VStack } from 'components/core/Spacer/Stack';
import { Paragraph, TITLE_FONT_FAMILY } from 'components/core/Text/Text';
import styled from 'styled-components';
import colors from 'components/core/colors';
import {
  ProfileDropdown,
  SlashText,
} from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/ProfileDropdown';
import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { GalleryNavLinks } from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavLinks';
import NavActionFollow from 'components/Follow/NavActionFollow';

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
        ...GalleryNavLinksFragment
        ...ProfileDropdownFragment
        ...NavActionFollowQueryFragment

        userByUsername(username: $username) {
          ...NavActionFollowUserFragment
        }

        collectionById(id: $collectionId) {
          ... on Collection {
            name
          }
        }
      }
    `,
    queryRef
  );

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const usernameRoute: Route = { pathname: '/[username]', query: { username } };

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent>
        <ProfileDropdown
          queryRef={query}
          rightContent={
            isMobile ? null : (
              <RightContentWrapper gap={4}>
                {query.userByUsername && (
                  <NavActionFollow userRef={query.userByUsername} queryRef={query} />
                )}

                <SlashText>/</SlashText>

                <CollectionNameText title={query.collectionById?.name ?? ''}>
                  {query.collectionById?.name}
                </CollectionNameText>
              </RightContentWrapper>
            )
          }
        />
      </NavbarLeftContent>

      <NavbarCenterContent>
        {isMobile ? (
          <VStack align="center">
            <Link href={usernameRoute}>
              <MobileUsernameText>{username}</MobileUsernameText>
            </Link>
            <BreadcrumbText>{query.collectionById?.name}</BreadcrumbText>
          </VStack>
        ) : (
          <GalleryNavLinks username={username} queryRef={query} />
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
  overflow: hidden;

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

  color: ${colors.shadow};
`;
