import { route } from 'nextjs-routes';
import styled from 'styled-components';

import breakpoints, { pageGutter } from '~/components/core/breakpoints';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import NavLink from '~/components/core/NavLink/NavLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS, TitleM } from '~/components/core/Text/Text';
import {
  GALLERY_BLOG,
  GALLERY_DISCORD,
  GALLERY_FAQ,
  GALLERY_JOBS,
  GALLERY_MEMBERSHIP_OPENSEA,
  GALLERY_TWITTER,
} from '~/constants/urls';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import LogoBracketLeft from '~/icons/LogoBracketLeft';
import LogoBracketRight from '~/icons/LogoBracketRight';
import { LogoLarge } from '~/icons/LogoLarge';
import colors from '~/shared/theme/colors';

type Props = {
  theme?: 'light' | 'dark';
};

function GlobalFooter({ theme = 'light' }: Props) {
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  return (
    <StyledGlobalFooter theme={theme}>
      {/* <VStack gap={110}> */}
      <HStack>
        <HStack gap={4}>
          <GalleryLink to={{ pathname: '/' }}>
            <StyledLogo theme={theme} />
          </GalleryLink>
        </HStack>
      </HStack>
      <HStack justify="space-between" align="end">
        <HStack gap={72} wrap="wrap">
          <VStack gap={8}>
            <StyledFooterLink href={GALLERY_FAQ}>FAQ</StyledFooterLink>
            <StyledFooterLink href={GALLERY_TWITTER}>Twitter</StyledFooterLink>
          </VStack>
          <VStack gap={8}>
            <StyledFooterLink href={GALLERY_DISCORD}>Discord</StyledFooterLink>
            <StyledFooterLink href={GALLERY_BLOG}>Blog</StyledFooterLink>
          </VStack>
          <VStack gap={8}>
            <StyledFooterLink href={GALLERY_JOBS}>Jobs</StyledFooterLink>
            <StyledFooterLink href={route({ pathname: '/shop' })}>
              <HStack gap={4}>Shop</HStack>
            </StyledFooterLink>
          </VStack>
        </HStack>
        <StyledFooterLinkContainer>
          <HStack gap={8}>
            <StyledFooterLink href={route({ pathname: '/privacy' })}>Privacy</StyledFooterLink>
            <StyledFooterLink href={route({ pathname: '/terms' })}>Terms</StyledFooterLink>
            <StyledPlainText color={colors.metal}>
              © Gallery Labs, {new Date().getFullYear()}{' '}
            </StyledPlainText>
          </HStack>
        </StyledFooterLinkContainer>
      </HStack>
      {/* </VStack> */}
    </StyledGlobalFooter>
  );
}

type StyledFooterProps = {
  isMobile?: boolean;
  theme: 'light' | 'dark';
};

export const GLOBAL_FOOTER_HEIGHT = 80;
export const GLOBAL_FOOTER_HEIGHT_MOBILE = 134;

const StyledFooterLink = styled(NavLink)<StyledFooterProps>`
  font-size: 16px;
  line-height: 20px;
  display: flex;
  text-transform: capitalize;
`;

const StyledGlobalFooter = styled.div<StyledFooterProps>`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 110px 0;

  padding: 0 ${pageGutter.mobile}px 24px;

  background-color: ${({ theme }) => (theme === 'light' ? colors.offWhite : colors.black['800'])};

  @media only screen and ${breakpoints.desktop} {
    padding: 80px;
  }

  ${StyledFooterLink} {
    color: ${({ theme }) => (theme === 'light' ? colors.black['800'] : colors.white)};

    &:hover {
      color: ${colors.shadow};
    }
  }
`;

const StyledHr = styled.hr`
  border: 1px solid #f7f7f7;
  width: 100%;
  margin: 16px 0px;
`;

const StyledLogo = styled(LogoLarge)<StyledFooterProps>`
  height: 36px;
  cursor: pointer;
  // color: ${colors.white};
  color: ${({ theme }) => (theme === 'light' ? colors.black['800'] : colors.white)};
`;

const StyledFooterLinkContainer = styled.div<{ isMobile: boolean }>`
  padding-top: ${({ isMobile }) => (isMobile ? '4px' : '0px')};
  height: fit-content;
`;

const StyledPlainText = styled(BaseM)`
  font-size: 16px;
`;

export default GlobalFooter;
