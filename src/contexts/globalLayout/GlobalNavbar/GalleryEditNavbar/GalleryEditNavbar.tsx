import { GalleryEditCenterContent } from 'contexts/globalLayout/GlobalNavbar/GalleryEditNavbar/GalleryEditCenterContent';
import { GalleryEditRightContent } from 'contexts/globalLayout/GlobalNavbar/GalleryEditNavbar/GalleryEditRightContent';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from 'contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { useNavbarEffect } from 'contexts/globalLayout/useNavbarEffect';

type Props = {
  onDone: () => void;
};

export function GalleryEditNavbar({ onDone }: Props) {
  return (
    <StandardNavbarContainer>
      {/* Strictly here to keep spacing consistent */}
      <NavbarLeftContent />

      <NavbarCenterContent>
        <GalleryEditCenterContent />
      </NavbarCenterContent>

      <NavbarRightContent>
        <GalleryEditRightContent onDone={onDone} />
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}
