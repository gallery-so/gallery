import { Route } from 'nextjs-routes';

import { BackButton } from '~/contexts/globalLayout/GlobalNavbar/BackButton';
import { CollectionConfirmationNavbar } from '~/contexts/globalLayout/GlobalNavbar/CollectionConfirmationNavbar/CollectionConfirmationNavbar';
import { GalleryNameAndCollectionName } from '~/contexts/globalLayout/GlobalNavbar/CollectionEditorNavbar/GalleryNameAndCollectionName';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from '~/contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';


type CollectionCreateNavbarProps = {
  onBack: () => void;
  onNext: (caption: string) => void;
  galleryId: string;
  isCollectionValid: boolean;
};

export function CollectionCreateNavbar({
  galleryId,
  onBack,
  onNext,
  isCollectionValid,
}: CollectionCreateNavbarProps) {
  const editGalleryRoute: Route = { pathname: '/gallery/[galleryId]/edit', query: { galleryId } };

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent>
        <BackButton onClick={onBack} />
      </NavbarLeftContent>

      <NavbarCenterContent>
        <GalleryNameAndCollectionName
          editGalleryRoute={editGalleryRoute}
          galleryName={'My gallery'}
          collectionName={'New Collection'}
          rightText="Creating"
        />
      </NavbarCenterContent>

      <NavbarRightContent>
        <CollectionConfirmationNavbar
          disabled={!isCollectionValid}
          onSave={onNext}
          hasUnsavedChange={true}
        />
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}