import styled from 'styled-components';
import { BodyRegular, Display } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';

function GalleryTitleIntro() {
  return (
    <>
      <StyledLogo caps>Gallery</StyledLogo>
      <Spacer height={8} />
      <BodyRegular>Show your collection to the world</BodyRegular>
      <Spacer height={32} />
    </>
  );
}

const StyledLogo = styled(Display)`
  font-size: 64px;
  letter-spacing: 0.05em;
`;

export default GalleryTitleIntro;
