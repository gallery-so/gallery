import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from 'contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { Button } from 'components/core/Button/Button';
import { BackButton } from 'contexts/globalLayout/GlobalNavbar/BackButton';
import { GalleryNameAndCollectionName } from 'contexts/globalLayout/GlobalNavbar/CollectionEditorNavbar/GalleryNameAndCollectionName';
import { Route } from 'nextjs-routes';

type CollectionCreateNavbarProps = {
  onBack: () => void;
  onNext: () => void;
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
        <Button disabled={!isCollectionValid} onClick={onNext}>
          Save
        </Button>
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}
