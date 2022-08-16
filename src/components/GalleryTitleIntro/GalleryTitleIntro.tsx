import styled from 'styled-components';
import { TitleM } from 'components/core/Text/Text';

function GalleryTitleIntro() {
  return (
    <>
      <StyledLogo src="/icons/logo-large.svg" />
      <TitleM>
        <strong>Share your </strong>collection <strong>with the world.</strong>
      </TitleM>
    </>
  );
}

export default GalleryTitleIntro;

const StyledLogo = styled.img`
  height: 32px;
`;
