import { useEffect } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import colors from '~/components/core/colors';
import { HStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeM } from '~/components/core/Text/Text';
import { ONBOARDING_NEXT_BUTTON_TEXT_MAP } from '~/components/Onboarding/constants';
import { GalleryTitleSection } from '~/contexts/globalLayout/EditGalleryNavbar/GalleryTitleSection';
import { BackButton } from '~/contexts/globalLayout/GlobalNavbar/BackButton';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from '~/contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';

type Props = {
  canSave: boolean;
  hasUnsavedChanges: boolean;
  galleryName: string;

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
  galleryName,
}: Props) {
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  useEffect(() => {
    function handlePress(event: KeyboardEvent) {
      if (event.key === 's' && event.metaKey) {
        // Avoid trying to save page as HTML
        event.preventDefault();

        onDone();
      }
    }

    window.addEventListener('keydown', handlePress);

    return () => window.removeEventListener('keydown', handlePress);
  }, [onDone]);

  return (
    <Wrapper>
      <StandardNavbarContainer>
        <NavbarLeftContent>
          {isMobile ? (
            <GalleryTitleSection galleryName={galleryName} onEdit={onEdit} />
          ) : (
            <BackButton onClick={onBack} />
          )}
        </NavbarLeftContent>

        <NavbarCenterContent>
          {!isMobile && <GalleryTitleSection galleryName={galleryName} onEdit={onEdit} />}
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
