import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { TitleM } from '~/components/core/Text/Text';
import { LogoLarge } from '~/icons/LogoLarge';

function GalleryTitleIntro() {
  return (
    <VStack gap={8}>
      <StyledLogo />
      <TitleM>
        <strong>Gallery is the easiest way to express yourself </strong>onchain
      </TitleM>
    </VStack>
  );
}

const StyledLogo = styled(LogoLarge)`
  height: 32px;
`;

export default GalleryTitleIntro;
