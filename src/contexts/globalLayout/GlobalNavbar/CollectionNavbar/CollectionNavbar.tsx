import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CollectionNavbarFragment$key } from '__generated__/CollectionNavbarFragment.graphql';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from '../StandardNavbarContainer';
import { ProfileDropdownOrSignInButton } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdownOrSignInButton';
import { BreadcrumbText } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';
import { CollectionRightContent } from 'contexts/globalLayout/GlobalNavbar/CollectionNavbar/CollectionRightContent';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import { VStack } from 'components/core/Spacer/Stack';
import { Paragraph, TITLE_FONT_FAMILY } from 'components/core/Text/Text';
import styled from 'styled-components';
import colors from 'components/core/colors';

type CollectionNavbarProps = {
  username: string;
  queryRef: CollectionNavbarFragment$key;
};

export function CollectionNavbar({ queryRef, username }: CollectionNavbarProps) {
  const query = useFragment(
    graphql`
      fragment CollectionNavbarFragment on Query {
        ...CollectionRightContentFragment
        ...ProfileDropdownOrSignInButtonFragment

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

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent>
        <ProfileDropdownOrSignInButton queryRef={query} />
      </NavbarLeftContent>

      <NavbarCenterContent>
        {isMobile ? (
          <>
            <VStack align="center">
              <MobileUsernameText>{username}</MobileUsernameText>
              <BreadcrumbText>{query.collectionById?.name}</BreadcrumbText>
            </VStack>
          </>
        ) : (
          <BreadcrumbText>{username}</BreadcrumbText>
        )}
      </NavbarCenterContent>

      <NavbarRightContent>
        <CollectionRightContent username={username} queryRef={query} />
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}

const MobileUsernameText = styled(Paragraph)`
  font-family: ${TITLE_FONT_FAMILY};
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;

  color: ${colors.shadow};
`;
