import { memo } from 'react';
import styled from 'styled-components';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM } from 'components/core/Text/Text';
import { GALLERY_DISCORD, GALLERY_TWITTER } from 'constants/urls';
import {
  GLOBAL_FOOTER_HEIGHT,
  GLOBAL_FOOTER_HEIGHT_MOBILE,
} from 'contexts/globalLayout/GlobalFooter/GlobalFooter';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import breakpoints from 'components/core/breakpoints';

function MaintenancePage() {
  return (
    <StyledMaintenancePage>
      <StyledLogo src="/icons/logo-large.svg" />
      <Spacer height={8} />
      <StyledBaseM>
        Gallery is currently undergoing planned maintenance until{' '}
        <strong>Monday June 20th, 11:59pm EST</strong> and is not usable at this time. Keep up to
        date on our socials.
      </StyledBaseM>
      <Spacer height={24} />
      <StyledLinkContainer>
        <StyledFooterLink href={GALLERY_DISCORD}>Discord</StyledFooterLink>
        <Spacer width={8} />
        <BaseM>·</BaseM>
        <Spacer width={8} />
        <StyledFooterLink href={GALLERY_TWITTER}>Twitter</StyledFooterLink>
      </StyledLinkContainer>
    </StyledMaintenancePage>
  );
}

const StyledLogo = styled.img`
  height: 32px;
`;

const StyledMaintenancePage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  padding-top: ${GLOBAL_FOOTER_HEIGHT_MOBILE}px;
  height: calc(100vh - ${GLOBAL_FOOTER_HEIGHT_MOBILE}px);

  @media only screen and ${breakpoints.mobileLarge} {
    padding-top: ${GLOBAL_FOOTER_HEIGHT}px;
    height: calc(100vh - ${GLOBAL_FOOTER_HEIGHT}px);
  }
`;

const StyledLinkContainer = styled.div`
  display: flex;
`;

const StyledBaseM = styled(BaseM)`
  width: 363px;
  text-align: center;
`;

const StyledFooterLink = styled(InteractiveLink)`
  text-transform: capitalize;
  font-size: 14px;
`;

export default memo(MaintenancePage);
