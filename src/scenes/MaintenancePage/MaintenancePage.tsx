import { memo } from 'react';
import styled from 'styled-components';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, BaseS } from 'components/core/Text/Text';
import NavLink from 'components/core/NavLink/NavLink';
import { GALLERY_DISCORD, GALLERY_TWITTER } from 'constants/urls';
import { FOOTER_HEIGHT } from 'flows/shared/components/WizardFooter/WizardFooter';

function MaintenancePage() {
  return (
    <StyledMaintenancePage>
      <StyledLogo src="/icons/logo-large.svg" />
      <Spacer height={8} />
      <StyledBaseM>
        Gallery is currently undergoing planned maintenance until Monday, 6/20 11:59am EST, and is
        not usable at this time. Keep up to date on our socials.
      </StyledBaseM>
      <Spacer height={24} />
      <StyledLinkContainer>
        <StyledFooterLink href={GALLERY_DISCORD}>Discord</StyledFooterLink>
        <Spacer width={8} />
        <BaseS>·</BaseS>
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

  padding-top: ${FOOTER_HEIGHT}px;
  height: calc(100vh - ${FOOTER_HEIGHT}px);
`;

const StyledLinkContainer = styled.div`
  display: flex;
`;

const StyledBaseM = styled(BaseM)`
  width: 363px;
  text-align: center;
`;

const StyledFooterLink = styled(NavLink)`
  text-transform: capitalize;
  font-size: 14px;
`;

export default memo(MaintenancePage);
