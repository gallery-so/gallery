import { Route } from 'nextjs-routes';

import { Button } from '~/components/core/Button/Button';
import { ONBOARDING_NEXT_BUTTON_TEXT_MAP } from '~/components/Onboarding/constants';
import { BackButton } from '~/contexts/globalLayout/GlobalNavbar/BackButton';
import { GalleryNameAndCollectionName } from '~/contexts/globalLayout/GlobalNavbar/CollectionEditorNavbar/GalleryNameAndCollectionName';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from '~/contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';

type OnboardingCollectionCreateNavbarProps = {
  onBack: () => void;
  onNext: () => void;
  isCollectionValid: boolean;
};

export function OnboardingCollectionCreateNavbar({
  onBack,
  onNext,
  isCollectionValid,
}: OnboardingCollectionCreateNavbarProps) {
  const editGalleryRoute: Route = { pathname: '/onboarding/organize-gallery' };

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
          {ONBOARDING_NEXT_BUTTON_TEXT_MAP['organize-collection']}
        </Button>
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}
