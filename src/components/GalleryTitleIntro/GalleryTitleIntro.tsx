import styled from 'styled-components';
import { BodyRegular, Display } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import Logo from 'public/icons/logo-large.svg';

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
