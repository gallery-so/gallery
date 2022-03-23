import styled from 'styled-components';
import { BodyRegular } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';

function GalleryTitleIntro() {
  return (
    <>
      <StyledLogo src="/icons/logo-large.svg" />
      <Spacer height={8} />
      <BodyRegular>Show your collection to the world.</BodyRegular>
    </>
  );
}

const StyledLogo = styled.img`
  height: 32px;
`;

export default GalleryTitleIntro;
