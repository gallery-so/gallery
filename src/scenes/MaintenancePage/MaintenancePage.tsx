import { memo } from 'react';
import styled from 'styled-components';
import { BaseM } from 'components/core/Text/Text';
import { GALLERY_DISCORD, GALLERY_TWITTER } from 'constants/urls';
import {
  GLOBAL_FOOTER_HEIGHT,
  GLOBAL_FOOTER_HEIGHT_MOBILE,
} from 'contexts/globalLayout/GlobalFooter/GlobalFooter';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import breakpoints from 'components/core/breakpoints';
import { HStack, VStack } from 'components/core/Spacer/Stack';

function MaintenancePage() {
  return (
    <StyledMaintenancePage gap={24}>
      <VStack gap={8}>
        <StyledLogo src="/icons/logo-large.svg" />
        <StyledBaseM>
          Gallery is currently undergoing planned maintenance until{' '}
          <strong>Monday June 20th, 11:59am EST</strong> and is not usable at this time. Keep up to
          date on our socials.
        </StyledBaseM>
      </VStack>
      <HStack gap={8}>
        <StyledFooterLink href={GALLERY_DISCORD}>Discord</StyledFooterLink>
        <BaseM>·</BaseM>
        <StyledFooterLink href={GALLERY_TWITTER}>Twitter</StyledFooterLink>
      </HStack>
    </StyledMaintenancePage>
  );
}

const StyledLogo = styled.img`
  height: 32px;
`;

const StyledMaintenancePage = styled(VStack)`
  justify-content: center;
  align-items: center;

  padding-top: ${GLOBAL_FOOTER_HEIGHT_MOBILE}px;
  height: calc(100vh - ${GLOBAL_FOOTER_HEIGHT_MOBILE}px);

  @media only screen and ${breakpoints.mobileLarge} {
    padding-top: ${GLOBAL_FOOTER_HEIGHT}px;
    height: calc(100vh - ${GLOBAL_FOOTER_HEIGHT}px);
  }
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
