import { memo } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { GALLERY_DISCORD, GALLERY_TWITTER } from '~/constants/urls';
import {
  GLOBAL_FOOTER_HEIGHT,
  GLOBAL_FOOTER_HEIGHT_MOBILE,
} from '~/contexts/globalLayout/GlobalFooter/GlobalFooter';
import { LogoLarge } from '~/icons/LogoLarge';

function MaintenancePage() {
  return (
    <StyledMaintenancePage gap={24}>
      <VStack gap={8}>
        <StyledLogo />
        <StyledBaseM>
          Gallery is currently undergoing planned maintenance until{' '}
          <strong>Saturday Feb 25th, 3:30pm EST</strong> and is not usable at this time. Keep up to
          date on our socials.
        </StyledBaseM>
      </VStack>
      <HStack gap={8}>
        <StyledFooterLink href={GALLERY_TWITTER}>Twitter</StyledFooterLink>
        <BaseM>·</BaseM>
        <StyledFooterLink href={GALLERY_DISCORD}>Discord</StyledFooterLink>
      </HStack>
    </StyledMaintenancePage>
  );
}

const StyledLogo = styled(LogoLarge)`
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
