import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from 'contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { Button } from 'components/core/Button/Button';
import { ONBOARDING_NEXT_BUTTON_TEXT_MAP } from 'components/Onboarding/constants';
import { BackButton } from 'contexts/globalLayout/GlobalNavbar/BackButton';
import { GalleryNameAndCollectionName } from 'contexts/globalLayout/GlobalNavbar/CollectionEditorNavbar/GalleryNameAndCollectionName';

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
          {ONBOARDING_NEXT_BUTTON_TEXT_MAP['organize-collection']}
        </Button>
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}
