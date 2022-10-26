import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from 'contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import styled from 'styled-components';
import { BODY_FONT_FAMILY, Paragraph, TitleXS } from 'components/core/Text/Text';
import { HStack } from 'components/core/Spacer/Stack';
import { Button } from 'components/core/Button/Button';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import Edit from '../../../../../pages/edit';
import colors from 'components/core/colors';
import breakpoints from 'components/core/breakpoints';

type Props = {
  onDone: () => void;
};

function EditingMyGallerySection() {
  return (
    <HStack gap={8} align="baseline">
      <MainGalleryText>My gallery</MainGalleryText>

      <EditingText>Editing</EditingText>
    </HStack>
  );
}

export function GalleryEditNavbar({ onDone }: Props) {
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  return (
    <Wrapper>
      <StandardNavbarContainer>
        {/* Strictly here to keep spacing consistent */}
        <NavbarLeftContent>{isMobile && <EditingMyGallerySection />}</NavbarLeftContent>

        <NavbarCenterContent>{!isMobile && <EditingMyGallerySection />}</NavbarCenterContent>

        <NavbarRightContent>
          <Button onClick={onDone}>Done</Button>
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

export const EditingText = styled(TitleXS)`
  font-weight: 500;
  text-transform: uppercase;
`;

export const MainGalleryText = styled(Paragraph)`
  font-family: ${BODY_FONT_FAMILY};
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 21px;
  letter-spacing: -0.04em;
  white-space: nowrap;
`;
