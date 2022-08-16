import styled from 'styled-components';
import { TitleM } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';

function GalleryTitleIntro() {
  return (
    <>
      <StyledLogo src="/icons/logo-large.svg" />
      <Spacer height={8} />
      <TitleM>
        <strong>Share your </strong>collection <strong>with the world.</strong>
      </TitleM>
    </>
  );
}

const StyledLogo = styled.img`
  height: 32px;
`;

export default GalleryTitleIntro;
