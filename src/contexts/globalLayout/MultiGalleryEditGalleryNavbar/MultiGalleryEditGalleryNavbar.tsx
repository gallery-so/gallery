import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import colors from '~/components/core/colors';
import { BODY_FONT_FAMILY, Paragraph } from '~/components/core/Text/Text';
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
  onBack: () => void;
  onDone: () => void;
};

function GalleryTitleSection() {
  return <MainGalleryText>My gallery</MainGalleryText>;
}

export function MultiGalleryEditGalleryNavbar({ canSave, onDone, onBack }: Props) {
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  return (
    <Wrapper>
      <StandardNavbarContainer>
        <NavbarLeftContent>
          {isMobile ? <GalleryTitleSection /> : <BackButton onClick={onBack} />}
        </NavbarLeftContent>

        <NavbarCenterContent>{!isMobile && <GalleryTitleSection />}</NavbarCenterContent>

        <NavbarRightContent>
          <Button disabled={!canSave} onClick={onDone}>
            Done
          </Button>
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
