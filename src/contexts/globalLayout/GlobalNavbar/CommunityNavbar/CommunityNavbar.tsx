import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ProfileDropdown } from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/ProfileDropdown';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from '~/contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { CommunityNavbarFragment$key } from '~/generated/CommunityNavbarFragment.graphql';

type CommunityNavbarProps = {
  queryRef: CommunityNavbarFragment$key;
};

export function CommunityNavbar({ queryRef }: CommunityNavbarProps) {
  const query = useFragment(
    graphql`
      fragment CommunityNavbarFragment on Query {
        ...ProfileDropdownFragment
      }
    `,
    queryRef
  );

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent>
        <ProfileDropdown queryRef={query} />
      </NavbarLeftContent>

      <NavbarCenterContent />
      <NavbarRightContent />
    </StandardNavbarContainer>
  );
}
