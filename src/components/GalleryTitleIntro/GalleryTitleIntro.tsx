import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { TitleM } from '~/components/core/Text/Text';

function GalleryTitleIntro() {
  return (
    <VStack gap={8}>
      <StyledLogo src="/icons/logo-large.svg" />
      <TitleM>
        <strong>Share your </strong>collection <strong>with the world.</strong>
      </TitleM>
    </VStack>
  );
}

const StyledLogo = styled.img`
  height: 32px;
`;

export default GalleryTitleIntro;
