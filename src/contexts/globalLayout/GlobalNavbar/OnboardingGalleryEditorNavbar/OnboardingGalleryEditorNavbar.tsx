import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from 'contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { Button } from 'components/core/Button/Button';
import { ONBOARDING_NEXT_BUTTON_TEXT_MAP } from 'components/Onboarding/constants';
import { BackButton } from 'contexts/globalLayout/GlobalNavbar/BackButton';
import { HStack } from 'components/core/Spacer/Stack';
import {
  EditingText,
  MainGalleryText,
} from 'contexts/globalLayout/GlobalNavbar/GalleryEditNavbar/GalleryEditNavbar';

type OnboardingGalleryEditorNavbarProps = {
  onBack: () => void;
  onNext: () => void;
};

export function OnboardingGalleryEditorNavbar({
  onBack,
  onNext,
}: OnboardingGalleryEditorNavbarProps) {
  return (
    <StandardNavbarContainer>
      <NavbarLeftContent>
        <BackButton onClick={onBack} />
      </NavbarLeftContent>

      <NavbarCenterContent>
        <HStack gap={8} align="baseline">
          <MainGalleryText>My main gallery</MainGalleryText>

          <EditingText>Creating</EditingText>
        </HStack>
      </NavbarCenterContent>

      <NavbarRightContent>
        <Button onClick={onNext}>{ONBOARDING_NEXT_BUTTON_TEXT_MAP['organize-gallery']}</Button>
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}
