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

type Props = {
  onDone: () => void;
};

export function GalleryEditNavbar({ onDone }: Props) {
  return (
    <StandardNavbarContainer>
      {/* Strictly here to keep spacing consistent */}
      <NavbarLeftContent />

      <NavbarCenterContent>
        <HStack gap={8} align="baseline">
          <MainGalleryText>My main gallery</MainGalleryText>

          <EditingText>Editing</EditingText>
        </HStack>
      </NavbarCenterContent>

      <NavbarRightContent>
        <Button onClick={onDone}>Done</Button>
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}

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
`;
