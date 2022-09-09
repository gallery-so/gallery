import styled from 'styled-components';
import { TitleM } from 'components/core/Text/Text';
import DeprecatedSpacer from 'components/core/Spacer/DeprecatedSpacer';

function GalleryTitleIntro() {
  return (
    <>
      <StyledLogo src="/icons/logo-large.svg" />
      <DeprecatedSpacer height={8} />
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
