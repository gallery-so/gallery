import { useCallback, useState } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import colors from '~/components/core/colors';
import { HStack } from '~/components/core/Spacer/Stack';
import { BODY_FONT_FAMILY, Paragraph, TitleDiatypeM } from '~/components/core/Text/Text';
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

  onBack: () => void;
  onDone: () => Promise<void>;
};

function GalleryTitleSection() {
  return <MainGalleryText>My gallery</MainGalleryText>;
}

export function MultiGalleryEditGalleryNavbar({
  canSave,
  onDone,
  onBack,
  hasUnsavedChanges,
}: Props) {
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const [loading, setLoading] = useState(false);
  const handleDone = useCallback(() => {
    setLoading(true);

    onDone()
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, [onDone]);

  return (
    <Wrapper>
      <StandardNavbarContainer>
        <NavbarLeftContent>
          {isMobile ? <GalleryTitleSection /> : <BackButton onClick={onBack} />}
        </NavbarLeftContent>

        <NavbarCenterContent>{!isMobile && <GalleryTitleSection />}</NavbarCenterContent>

        <NavbarRightContent>
          <HStack align="center" gap={12}>
            {hasUnsavedChanges && (
              <TitleDiatypeM color={colors.metal}>Unsaved Changes</TitleDiatypeM>
            )}

            <Button pending={loading} disabled={!canSave} onClick={handleDone}>
              Done
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

export const MainGalleryText = styled(Paragraph)`
  font-family: ${BODY_FONT_FAMILY};
  font-style: normal;
  font-weight: 500;
  line-height: 21px;
  letter-spacing: -0.04em;
  white-space: nowrap;

  font-size: 16px;

  @media only screen and ${breakpoints.tablet} {
    font-size: 18px;
  }
`;
