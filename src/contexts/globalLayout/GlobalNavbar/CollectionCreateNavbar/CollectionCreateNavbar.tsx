import { useGlobalLayoutActions } from 'contexts/globalLayout/GlobalLayoutContext';
import { useLayoutEffect } from 'react';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from 'contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { Button } from 'components/core/Button/Button';
import { BackButton } from 'contexts/globalLayout/GlobalNavbar/BackButton';
import { GalleryNameAndCollectionName } from 'contexts/globalLayout/GlobalNavbar/CollectionEditorNavbar/GalleryNameAndCollectionName';

type CollectionCreateNavbarProps = {
  onBack: () => void;
  onNext: () => void;
  isCollectionValid: boolean;
};

export function CollectionCreateNavbar({
  onBack,
  onNext,
  isCollectionValid,
}: CollectionCreateNavbarProps) {
  return (
    <StandardNavbarContainer>
      <NavbarLeftContent>
        <BackButton onClick={onBack} />
      </NavbarLeftContent>

      <NavbarCenterContent>
        <GalleryNameAndCollectionName
          galleryName={'My main gallery'}
          collectionName={'New Collection'}
          rightText="Creating"
        />
      </NavbarCenterContent>

      <NavbarRightContent>
        <Button disabled={!isCollectionValid} onClick={onNext}>
          Save
        </Button>
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}
