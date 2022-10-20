import GalleryLeftContent from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryLeftContent';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { GalleryNavbarFragment$key } from '../../../../../__generated__/GalleryNavbarFragment.graphql';
import GalleryCenterContent from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryCenterContent';
import { GalleryRightContent } from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryRightContent';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from 'contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';

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
      }
    `,
    queryRef
  );

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent>
        <GalleryLeftContent queryRef={query} />
      </NavbarLeftContent>
      <NavbarCenterContent>
        {/* Disabled until we launch the galleries / followers page */}
        <GalleryCenterContent username={username} />
      </NavbarCenterContent>
      <NavbarRightContent>
        <GalleryRightContent queryRef={query} />
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}
