import { Route } from 'nextjs-routes';

import { ONBOARDING_NEXT_BUTTON_TEXT_MAP } from '~/components/Onboarding/constants';
import { BackButton } from '~/contexts/globalLayout/GlobalNavbar/BackButton';
import { GalleryNameAndCollectionName } from '~/contexts/globalLayout/GlobalNavbar/CollectionEditorNavbar/GalleryNameAndCollectionName';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from '~/contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';

import { CollectionSaveButtonWithCaption } from '../CollectionSaveButtonWithCaption';

type OnboardingCollectionCreateNavbarProps = {
  onBack: () => void;
  onNext: (caption: string) => void;
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
        <CollectionSaveButtonWithCaption
          disabled={!isCollectionValid}
          label={ONBOARDING_NEXT_BUTTON_TEXT_MAP['organize-collection']}
          onSave={onNext}
          hasUnsavedChange={true}
        />
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}
