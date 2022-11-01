import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CommunityNavbarFragment$key } from '__generated__/CommunityNavbarFragment.graphql';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from 'contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { ProfileDropdown } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/ProfileDropdown';

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
