import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import colors from '~/components/core/colors';
import { HStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeM } from '~/components/core/Text/Text';
import { ONBOARDING_NEXT_BUTTON_TEXT_MAP } from '~/components/Onboarding/constants';
import { BackButton } from '~/contexts/globalLayout/GlobalNavbar/BackButton';
import { GalleryTitleSection } from '~/contexts/globalLayout/GlobalNavbar/EditGalleryNavbar/GalleryTitleSection';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from '~/contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { useSaveHotkey } from '~/hooks/useSaveHotkey';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';

type Props = {
  canSave: boolean;
  hasUnsavedChanges: boolean;
  galleryName: string;

  dialogMessage: string;
  step: number;

  onNextStep: () => void;
  dialogOnClose: () => void;

  onEdit: () => void;

  onBack: () => void;
  onDone: () => Promise<void>;
};

export function OnboardingEditGalleryNavbar({
  canSave,

  onDone,
  onBack,
  onEdit,
  hasUnsavedChanges,

  dialogMessage,
  step,
  onNextStep,
  dialogOnClose,

  galleryName,
}: Props) {
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  useSaveHotkey(() => {
    onDone();
  });

  return (
    <Wrapper>
      <StandardNavbarContainer>
        <NavbarLeftContent>
          {isMobile ? (
            <GalleryTitleSection
              galleryName={galleryName}
              onEdit={onEdit}
              step={step}
              dialogMessage={dialogMessage}
              onNextStep={onNextStep}
              dialogOnClose={dialogOnClose}
            />
          ) : (
            <BackButton onClick={onBack} />
          )}
        </NavbarLeftContent>

        <NavbarCenterContent>
          {!isMobile && (
            <GalleryTitleSection
              galleryName={galleryName}
              onEdit={onEdit}
              step={step}
              dialogMessage={dialogMessage}
              onNextStep={onNextStep}
              dialogOnClose={dialogOnClose}
            />
          )}
        </NavbarCenterContent>

        <NavbarRightContent>
          <HStack align="center" gap={12}>
            {hasUnsavedChanges && (
              <TitleDiatypeM color={colors.metal}>Unsaved Changes</TitleDiatypeM>
            )}

            <Button onClick={onDone} disabled={!canSave}>
              {ONBOARDING_NEXT_BUTTON_TEXT_MAP['edit-gallery']}
            </Button>
          </HStack>
        </NavbarRightContent>
      </StandardNavbarContainer>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  border-bottom: 1px solid ${colors.porcelain};

  @media only screen and ${breakpoints.tablet} {
    border: none;
  }
`;
