import { HStack } from 'components/core/Spacer/Stack';
import { BODY_FONT_FAMILY, Paragraph, TitleXS } from 'components/core/Text/Text';
import styled from 'styled-components';

export function GalleryEditCenterContent() {
  return (
    <HStack gap={8} align="baseline">
      <MainGalleryText>My main gallery</MainGalleryText>

      <EditingText>Editing</EditingText>
    </HStack>
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
