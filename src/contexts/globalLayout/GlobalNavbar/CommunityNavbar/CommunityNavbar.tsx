import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CommunityNavbarFragment$key } from '__generated__/CommunityNavbarFragment.graphql';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from 'contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { ProfileDropdownOrSignInButton } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdownOrSignInButton';

type CommunityNavbarProps = {
  queryRef: CommunityNavbarFragment$key;
};

export function CommunityNavbar({ queryRef }: CommunityNavbarProps) {
  const query = useFragment(
    graphql`
      fragment CommunityNavbarFragment on Query {
        ...ProfileDropdownOrSignInButtonFragment
      }
    `,
    queryRef
  );

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent>
        <ProfileDropdownOrSignInButton queryRef={query} />
      </NavbarLeftContent>

      <NavbarCenterContent />
      <NavbarRightContent />
    </StandardNavbarContainer>
  );
}
